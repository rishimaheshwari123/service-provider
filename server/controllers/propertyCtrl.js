const Property = require('../models/propertyModel');
const { uploadImageToCloudinary } = require("../config/s3Uploader");
const AuditLogs = require("../models/auditLogs");  // correct path use karna
const mongoose = require('mongoose');
const createSystemLog = require("../utils/auditLogger");
const Category = require("../models/categoryModel");


const createPropertyCtrl = async (req, res) => {
    try {
        const {
            title,
            price,
            location,
            type,
            category,
            description,
            images,
            vendor,
        } = req.body;

        // Parse images if sent as a stringified array
        const imagesArray = typeof images === 'string' ? JSON.parse(images) : images;

        // Validate required fields
        if (!title || !price || !location || !type || !category || !vendor) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Validate category ObjectId
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID',
            });
        }

        // Verify category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        // Create new property
        const property = await Property.create({
            title,
            price,
            location,
            type,
            category, // Now ObjectId
            description,
            images: imagesArray,
            vendor,
        });

        // Populate category for response
        await property.populate('category', 'name');

        await createSystemLog({
            actorId: req.user?.id || null,
            actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
            entityId: property._id,
            entityModel: "Property",
            action: "CREATE",
            description: `Property created: ${title}`,
            newData: {
                title: property.title,
                price: property.price,
                location: property.location,
                type: property.type,
                category: property.category,
                description: property.description,
                images: property.images,
                vendor: property.vendor,
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Property created successfully!',
            property,
        });
    } catch (error) {
        console.error('Error creating property:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating property!',
        });
    }
};

const getPropertiesByVendor = async (req, res) => {
    try {
        const { vendor } = req.body;

        if (!vendor) {
            return res.status(400).json({ message: 'Vendor ID is required' });
        }

        const properties = await Property.find({ vendor })
            .populate('vendor')
            .populate('category', 'name');

        res.status(200).json({
            success: true,
            properties
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


// Admin direct update (no approval needed)
const updatePropertyCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            price,
            location,
            type,
            category,
            description,
            images,
            status,
        } = req.body;

        // Parse images safely
        let imagesArray = [];
        if (images) {
            if (typeof images === 'string') {
                try {
                    imagesArray = JSON.parse(images);
                } catch (error) {
                    console.log("Error parsing images:", error);
                    imagesArray = [];
                }
            } else if (Array.isArray(images)) {
                imagesArray = images;
            }
        }

        // Find property
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Update fields
        if (title) property.title = title;
        if (price) property.price = price;
        if (location) property.location = location;
        if (type) property.type = type;
        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID',
                });
            }

            const Category = require('../models/categoryModel');
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }

            property.category = category;
        }
        if (description !== undefined) property.description = description;
        property.images = imagesArray;
        if (status && ['active', 'inactive'].includes(status)) property.status = status;

        await property.save();

        await createSystemLog({
            actorId: req.user?.id || null,
            actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
            entityId: property._id,
            entityModel: "Property",
            action: "UPDATE",
            description: `Property updated: ${property.title}`
        });

        return res.status(200).json({
            success: true,
            message: 'Property updated successfully!',
            property,
        });
    } catch (error) {
        console.error('Error updating property:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating property!',
        });
    }
}

// Vendor update request (requires approval)
const vendorUpdatePropertyRequestCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            price,
            location,
            type,
            category,
            description,
            images,
            status,
            reason
        } = req.body;

        // Parse images safely
        let imagesArray = [];
        if (images) {
            if (typeof images === 'string') {
                try {
                    imagesArray = JSON.parse(images);
                } catch (error) {
                    console.log("Error parsing images:", error);
                    imagesArray = [];
                }
            } else if (Array.isArray(images)) {
                imagesArray = images;
            }
        }

        // Find property
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Validate category if provided
        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID',
                });
            }

            const Category = require('../models/categoryModel');
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }
        }

        // Check if there's already a pending request
        const ServiceUpdateRequest = require('../models/serviceUpdateRequestModel');
        const existingRequest = await ServiceUpdateRequest.findOne({
            property: id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'There is already a pending update request for this service. Please wait for admin approval.',
            });
        }

        // Create update request
        const updateRequest = new ServiceUpdateRequest({
            property: id,
            vendor: property.vendor,
            requestType: 'update',
            proposedChanges: {
                title: title || property.title,
                price: price || property.price,
                location: location || property.location,
                type: type || property.type,
                category: category || property.category,
                description: description !== undefined ? description : property.description,
                images: imagesArray.length > 0 ? imagesArray : property.images,
                status: status || property.status,
            },
            currentValues: {
                title: property.title,
                price: property.price,
                location: property.location,
                type: property.type,
                category: property.category,
                description: property.description,
                images: property.images,
                status: property.status,
            },
            reason: reason || 'Service update request'
        });

        const changedOldData = {};
        const changedNewData = {};

        Object.keys(updateRequest.currentValues).forEach((key) => {
          if (
            JSON.stringify(updateRequest.currentValues[key]) !==
            JSON.stringify(updateRequest.proposedChanges[key])
          ) {
            changedOldData[key] = updateRequest.currentValues[key];
            changedNewData[key] = updateRequest.proposedChanges[key];
          }
        });

        await updateRequest.save();

       await createSystemLog({
         actorId: req.user?.id || null,
         actorModel:
           req.user?.role === "admin"
             ? "auth"
             : req.user?.role === "vendor"
               ? "Vendor"
               : null,

         entityId: updateRequest._id,
         entityModel: "ServiceUpdateRequest",

         action: "CREATE",

         description: `Vendor submitted update request for property "${property.title}"`,

         oldData: changedOldData,

         newData: changedNewData,

         ipAddress: req.ip,
         userAgent: req.headers["user-agent"],
       });

        return res.status(201).json({
            success: true,
            message: 'Update request submitted successfully! Waiting for admin approval.',
            request: updateRequest,
        });

    } catch (error) {
        console.error('Error creating service update request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting update request!',
        });
    }
}


// Helper function to normalize text for comparison
const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/[.\-_\s]+/g, '') // Remove dots, hyphens, underscores, and spaces
        .trim();
};

// Helper function to check if location matches vendor's service locations
const matchesServiceLocation = (vendorServiceLocation, searchLocation) => {
    if (!vendorServiceLocation || !searchLocation) return false;
    
    // Normalize the search location
    const normalizedSearch = normalizeText(searchLocation);
    
    // Split vendor's service locations by comma and normalize each
    const vendorLocations = vendorServiceLocation
        .split(',')
        .map(loc => normalizeText(loc.trim()))
        .filter(loc => loc.length > 0);
    
    // Check if search term matches any of the vendor's service locations
    // Using partial matching - if search is contained in any location
    return vendorLocations.some(loc => 
        loc.includes(normalizedSearch) || normalizedSearch.includes(loc)
    );
};

const matchesServiceArea = (vendor, city, state) => {
    if (!vendor || !vendor.serviceLocation) return false;

    const cityMatch = city && city.trim()
        ? matchesServiceLocation(vendor.serviceLocation, city)
        : false;

    const stateMatch = state && state.trim()
        ? matchesServiceLocation(vendor.serviceLocation, state)
        : false;

    return cityMatch || stateMatch;
};

const getPropertiesCtrl = async (req, res) => {
    try {
        const { category, includeInactive, search, page, limit, serviceLocation, serviceState } = req.query;

        // Parse pagination params
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

        let query = {};
        
        // For admin view, include inactive services; for public view, only active
        if (includeInactive !== 'true') {
            query.status = 'active';
        }
        
        // Add category filter - prioritize ObjectId filtering
        if (category && category !== 'all') {
            // First check if category is a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(category)) {
                // Convert to ObjectId for proper type matching
                query.category = new mongoose.Types.ObjectId(category);
            } else {
                // If not ObjectId, treat as category name with normalized matching
                const Category = require('../models/categoryModel');
                const normalizedCategory = normalizeText(category);
                
                // Get all categories and find match by normalized name
                const allCategories = await Category.find({});
                const matchedCategory = allCategories.find(cat => 
                    normalizeText(cat.name) === normalizedCategory
                );
                
                if (matchedCategory) {
                    query.category = matchedCategory._id;
                } else {
                    // Category not found, return empty results
                    return res.status(200).json({
                        success: true,
                        properties: [],
                        pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 }
                    });
                }
            }
        }

        // Fetch all matching properties with populated fields
        let properties = await Property.find(query)
            .populate('vendor')
            .populate('review')
            .populate('category', 'name');

        // Filter by requested city/state service area (for mobile app)
        if ((serviceLocation && serviceLocation.trim()) || (serviceState && serviceState.trim())) {
            properties = properties.filter(prop => {
                return matchesServiceArea(prop.vendor, serviceLocation, serviceState);
            });
        }

        // Server-side search across populated fields with normalized matching
        if (search && search.trim()) {
            const searchTerm = search.trim().toLowerCase();
            const normalizedSearch = normalizeText(search);
            
            properties = properties.filter(prop => {
                const fields = [
                    prop.title,
                    prop.description,
                    prop.location,
                    prop.state,
                    prop.city,
                    prop.zipcode,
                    prop.pincode,
                    prop.address,
                    prop.category?.name,
                    prop.vendor?.name,
                    prop.vendor?.company,
                    prop.vendor?.address,
                    prop.vendor?.city,
                    prop.vendor?.state,
                    prop.vendor?.pincode,
                    prop.vendor?.zipcode,
                    prop.vendor?.location,
                    prop.vendor?.serviceLocation,
                    prop.vendor?.phone,
                ];
                
                // Check both regular and normalized matching
                return fields.some(f => {
                    if (!f) return false;
                    const fieldStr = f.toString().toLowerCase();
                    const normalizedField = normalizeText(f);
                    return fieldStr.includes(searchTerm) || normalizedField.includes(normalizedSearch);
                });
            });
        }

        // Calculate pagination
        const total = properties.length;
        const totalPages = Math.ceil(total / limitNum);
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedProperties = properties.slice(startIndex, startIndex + limitNum);

        res.status(200).json({
            success: true,
            properties: paginatedProperties,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


const getPropertiesByIdCtrl = async (req, res) => {
    try {
        const { id } = req.params; // propertyId
        const { userId } = req.query; // userId from query

        // ----------------------------
        // Fetch property
        // ----------------------------
        const property = await Property.findById(id)
            .populate('vendor')
            .populate('category', 'name');

        res.status(200).json({
            success: true,
            property,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const deletePropertyCtrl = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProperty = await Property.findByIdAndDelete(id);

        if (!deletedProperty) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        await createSystemLog({
            actorId: req.user?.id || null,
            actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
            entityId: deletedProperty._id,
            entityModel: "Property",
            action: "DELETE",
            description: `Property deleted: ${deletedProperty.title}`,
            newData: {
                isDeleted: true
            },
            req
        });

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully',
            property: deletedProperty,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

// Update property status (active/inactive)
const updatePropertyStatusCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Valid status (active/inactive) is required' 
            });
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        if (!updatedProperty) {
            return res.status(404).json({ 
                success: false,
                message: 'Property not found' 
            });
        }

        await createSystemLog({
            actorId: req.user?.id || null,
            actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
            entityId: updatedProperty._id,
            entityModel: "Property",
            action: "STATUS_CHANGE",
            description: `Property status updated to ${status}`,
            newData: {
                status: updatedProperty.status
            }
        });

        res.status(200).json({
            success: true,
            message: `Property ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
            property: updatedProperty
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Something went wrong' 
        });
    }
};

const migrateCategoryNamesToIds = async (req, res) => {
  try {
    const properties = await Property.find({
      category: { $type: "string" }
    });

    let migrated = 0;
    let failed = [];

    for (let property of properties) {
      try {
        const category = await Category.findOne({ 
          name: { $regex: new RegExp(`^${property.category.trim()}$`, 'i') }
        });

        if (category) {
          await Property.findByIdAndUpdate(property._id, {
            category: category._id
          });
          migrated++;
        } else {
          failed.push({
            propertyId: property._id,
            categoryName: property.category,
            propertyTitle: property.title
          });
        }
      } catch (error) {
        failed.push({
          propertyId: property._id,
          categoryName: property.category,
          error: error.message
        });
      }
    }

    await createSystemLog({
        actorId: req.user?.id || null,
        actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
        entityId: null,
        entityModel: "System",
        action: "MIGRATE",
        description: `Migrated ${migrated} properties. Failed: ${failed.length}`,
    });

    res.json({
      success: true,
      message: `Migration completed. ${migrated} properties migrated.`,
      migrated,
      failed: failed.length,
      failedDetails: failed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error.message
    });
  }
};

// Upload service image request (goes through approval)
const uploadServiceImageRequestCtrl = async (req, res) => {
    try {
        const { id } = req.params; // property id
        const { images, reason } = req.body;

        // Parse images safely
        let imagesArray = [];
        if (images) {
            if (typeof images === 'string') {
                try {
                    imagesArray = JSON.parse(images);
                } catch (error) {
                    console.log("Error parsing images:", error);
                    imagesArray = [];
                }
            } else if (Array.isArray(images)) {
                imagesArray = images;
            }
        }

        // Find the property
        const property = await Property.findById(id).populate('category');
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Check if there's already a pending request for this property
        const ServiceUpdateRequest = require('../models/serviceUpdateRequestModel');
        const existingRequest = await ServiceUpdateRequest.findOne({
            property: id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'There is already a pending update request for this service. Please wait for admin approval.',
            });
        }

        // Create the image update request
        const updateRequest = new ServiceUpdateRequest({
            property: id,
            vendor: property.vendor,
            requestType: 'image_update',
            proposedChanges: {
                title: property.title,
                price: property.price,
                location: property.location,
                type: property.type,
                category: property.category._id,
                description: property.description,
                images: imagesArray,
                status: property.status,
            },
            currentValues: {
                title: property.title,
                price: property.price,
                location: property.location,
                type: property.type,
                category: property.category._id,
                description: property.description,
                images: property.images,
                status: property.status,
            },
            reason: reason || 'Service image update request'
        });

        await updateRequest.save();

        await createSystemLog({
            actorId: req.user?.id || null,
            actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
            entityId: updateRequest._id,
            entityModel: "ServiceUpdateRequest",
            action: "CREATE",
            description: `Vendor image update request submitted`,
        });

        return res.status(201).json({
            success: true,
            message: 'Image update request submitted successfully! Waiting for admin approval.',
            request: updateRequest,
        });

    } catch (error) {
        console.error('Error creating image update request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting image update request!',
        });
    }
};

module.exports = { createPropertyCtrl, getPropertiesByVendor, updatePropertyCtrl, vendorUpdatePropertyRequestCtrl, getPropertiesCtrl, getPropertiesByIdCtrl, deletePropertyCtrl, updatePropertyStatusCtrl, migrateCategoryNamesToIds, uploadServiceImageRequestCtrl };
