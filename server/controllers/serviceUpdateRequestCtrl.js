const ServiceUpdateRequest = require('../models/serviceUpdateRequestModel');
const Property = require('../models/propertyModel');
const mongoose = require('mongoose');
const createSystemLog = require("../utils/auditLogger");
const Category = require("../models/categoryModel");

// Create service update request (vendor submits update)
const createServiceUpdateRequestCtrl = async (req, res) => {
    try {
        const { id } = req.params; // property id
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

        // Find the property
        const property = await Property.findById(id).populate('category');
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Validate category if provided
        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID',
            });
        }

        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }
        }

        // Check if there's already a pending request for this property
        const existingRequest = await ServiceUpdateRequest.findOne({
            property: id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'There is already a pending update request for this service',
            });
        }

        // Create the update request
        const updateRequest = new ServiceUpdateRequest({
            property: id,
            vendor: property.vendor,
            requestType: 'update',
            proposedChanges: {
                title: title || property.title,
                price: price || property.price,
                location: location || property.location,
                type: type || property.type,
                category: category || property.category._id,
                description: description !== undefined ? description : property.description,
                images: imagesArray.length > 0 ? imagesArray : property.images,
                status: status || property.status,
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
            reason: reason || 'Service update request'
        });

        await updateRequest.save();

        await createSystemLog({
            actorId: req.user?.id || null,
            actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
            entityId: updateRequest._id,
            entityModel: "ServiceUpdateRequest",
            action: "CREATE",
            description: `Service update request submitted`,
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
};

// Create image update request
const createImageUpdateRequestCtrl = async (req, res) => {
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
        const existingRequest = await ServiceUpdateRequest.findOne({
            property: id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'There is already a pending update request for this service',
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
            description: `Image update request submitted`,
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

// Get all pending service update requests (for admin)
const getPendingServiceUpdateRequestsCtrl = async (req, res) => {
    try {
        const requests = await ServiceUpdateRequest.find({ status: 'pending' })
            .populate('property')
            .populate('vendor', 'name email phone')
            .populate('proposedChanges.category', 'name')
            .populate('currentValues.category', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Pending service update requests fetched successfully',
            requests,
        });

    } catch (error) {
        console.error('Error fetching pending requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching pending requests!',
        });
    }
};

// Get service update requests by vendor
const getVendorServiceUpdateRequestsCtrl = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const requests = await ServiceUpdateRequest.find({ vendor: vendorId })
            .populate('property')
            .populate('proposedChanges.category', 'name')
            .populate('currentValues.category', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Vendor service update requests fetched successfully',
            requests,
        });

    } catch (error) {
        console.error('Error fetching vendor requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching vendor requests!',
        });
    }
};

// Approve service update request (admin)
const approveServiceUpdateRequestCtrl = async (req, res) => {
    try {
        const { id } = req.params; // request id
        const { adminId, message } = req.body;

        const updateRequest = await ServiceUpdateRequest.findById(id);
        if (!updateRequest) {
            return res.status(404).json({
                success: false,
                message: 'Update request not found',
            });
        }

        if (updateRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed',
            });
        }

        // Update the property with proposed changes
        const property = await Property.findById(updateRequest.property);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Apply the proposed changes
        const { proposedChanges } = updateRequest;
        property.title = proposedChanges.title;
        property.price = proposedChanges.price;
        property.location = proposedChanges.location;
        property.type = proposedChanges.type;
        property.category = proposedChanges.category;
        property.description = proposedChanges.description;
        property.images = proposedChanges.images;
        property.status = proposedChanges.status;

        await property.save();

        // Update request status
        updateRequest.status = 'approved';
        updateRequest.adminResponse = {
            message: message || 'Request approved',
            respondedBy: adminId,
            respondedAt: new Date(),
        };

        await updateRequest.save();

        await createSystemLog({
            actorId: adminId || req.user?.id || null,
            actorModel: "auth",
            entityId: updateRequest._id,
            entityModel: "ServiceUpdateRequest",
            action: "STATUS_CHANGE",
            description: `Service update request approved`,
        });

        return res.status(200).json({
            success: true,
            message: 'Service update request approved successfully',
            request: updateRequest,
            property,
        });

    } catch (error) {
        console.error('Error approving request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error approving request!',
        });
    }
};

// Reject service update request (admin)
const rejectServiceUpdateRequestCtrl = async (req, res) => {
    try {
        const { id } = req.params; // request id
        const { adminId, message } = req.body;

        const updateRequest = await ServiceUpdateRequest.findById(id);
        if (!updateRequest) {
            return res.status(404).json({
                success: false,
                message: 'Update request not found',
            });
        }

        if (updateRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed',
            });
        }

        // Update request status
        updateRequest.status = 'rejected';
        updateRequest.adminResponse = {
            message: message || 'Request rejected',
            respondedBy: adminId,
            respondedAt: new Date(),
        };

        await updateRequest.save();

        await createSystemLog({
            actorId: adminId || req.user?.id || null,
            actorModel: "auth",
            entityId: updateRequest._id,
            entityModel: "ServiceUpdateRequest",
            action: "STATUS_CHANGE",
            description: `Service update request rejected`,
        });

        return res.status(200).json({
            success: true,
            message: 'Service update request rejected',
            request: updateRequest,
        });

    } catch (error) {
        console.error('Error rejecting request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error rejecting request!',
        });
    }
};

module.exports = {
    createServiceUpdateRequestCtrl,
    createImageUpdateRequestCtrl,
    getPendingServiceUpdateRequestsCtrl,
    getVendorServiceUpdateRequestsCtrl,
    approveServiceUpdateRequestCtrl,
    rejectServiceUpdateRequestCtrl,
};