const Property = require('../models/propertyModel');
const { uploadImageToCloudinary } = require("../config/s3Uploader");
const AuditLogs = require("../models/auditLogs");  // correct path use karna
const mongoose = require('mongoose');

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
        const Category = require('../models/categoryModel');
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

        // Parse images safely - handle empty string, null, undefined, or empty array
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
            // Validate category ObjectId
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID',
                });
            }
            
            // Verify category exists
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
        if (description !== undefined) property.description = description; // Allow empty description
        
        // Always update images array (even if empty) - this allows removal of all images
        property.images = imagesArray;
        
        if (status && ['active', 'inactive'].includes(status)) property.status = status;

        await property.save();

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
};


const getPropertiesCtrl = async (req, res) => {
    try {
        const { category, includeInactive } = req.query;

        let query = {};
        
        // For admin view, include inactive services; for public view, only active
        if (includeInactive !== 'true') {
            query.status = 'active';
        }
        
        // Add category filter - prioritize ObjectId filtering
        if (category && category !== 'all') {
            // First check if category is a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(category)) {
                // Use ObjectId directly for efficient filtering
                query.category = category;
            } else {
                // If not ObjectId, treat as category name (backward compatibility)
                const Category = require('../models/categoryModel');
                const categoryDoc = await Category.findOne({ 
                    name: { $regex: new RegExp(`^${category}$`, 'i') }
                });
                
                if (categoryDoc) {
                    query.category = categoryDoc._id;
                } else {
                    // Category not found, return empty results
                    return res.status(200).json({
                        success: true,
                        properties: []
                    });
                }
            }
        }

        const properties = await Property.find(query)
            .populate('vendor')
            .populate('review')
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

module.exports = { createPropertyCtrl, getPropertiesByVendor, updatePropertyCtrl, getPropertiesCtrl, getPropertiesByIdCtrl, deletePropertyCtrl, updatePropertyStatusCtrl, migrateCategoryNamesToIds };
