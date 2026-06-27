const VendorProfileUpdateRequest = require("../models/vendorProfileUpdateRequestModel");
const vendorModel = require("../models/vendorModel");
const createSystemLog = require("../utils/auditLogger");

const numberFields = new Set(["selectedPrice", "numberOfStaff"]);
const normalizePhone = (value) => (value || "").toString().trim();
const buildUniquePhones = (...values) => [...new Set(values.map(normalizePhone).filter(Boolean))];
const phoneFieldLabelMap = {
  phone: "Phone",
  whatsappNumber: "WhatsApp",
  alternatePhone: "Alternate phone",
};

const findVendorByAnyNumber = async (numbers, excludeVendorId = null) => {
  const uniqueNumbers = buildUniquePhones(...numbers);
  if (!uniqueNumbers.length) return null;

  const query = {
    $or: [
      { phone: { $in: uniqueNumbers } },
      { whatsappNumber: { $in: uniqueNumbers } },
      { alternatePhone: { $in: uniqueNumbers } },
    ],
  };

  if (excludeVendorId) {
    query._id = { $ne: excludeVendorId };
  }

  return vendorModel.findOne(query).select("_id phone whatsappNumber alternatePhone");
};

const getConflictingInputFields = (inputNumbers, existingVendor) => {
  if (!existingVendor) return [];
  const existingNumbers = buildUniquePhones(
    existingVendor.phone,
    existingVendor.whatsappNumber,
    existingVendor.alternatePhone
  );

  const conflicts = [];
  if (inputNumbers.phone && existingNumbers.includes(inputNumbers.phone)) conflicts.push("phone");
  if (inputNumbers.whatsappNumber && existingNumbers.includes(inputNumbers.whatsappNumber)) conflicts.push("whatsappNumber");
  if (inputNumbers.alternatePhone && existingNumbers.includes(inputNumbers.alternatePhone)) conflicts.push("alternatePhone");
  return [...new Set(conflicts)];
};

const buildDuplicateNumberMessage = (conflictFields) => {
  if (!conflictFields?.length) {
    return "This number is already registered with another vendor.";
  }
  if (conflictFields.length === 1) {
    return `${phoneFieldLabelMap[conflictFields[0]]} number is already registered with another vendor.`;
  }
  const labels = conflictFields.map((field) => phoneFieldLabelMap[field]);
  return `${labels.join(", ")} numbers are already registered with another vendor.`;
};

const sanitizeRequestedValue = (key, value) => {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "undefined" || trimmed.toLowerCase() === "null") {
      return undefined;
    }

    if (numberFields.has(key)) {
      const parsedNumber = Number(trimmed);
      return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
    }

    return value;
  }

  if (numberFields.has(key) && typeof value !== "number") {
    const parsedNumber = Number(value);
    return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
  }

  return value;
};

// Helper function to get changed fields
const getChangedFields = (original, updated) => {
  const changes = [];
  const fieldsToCompare = Object.keys(updated);

  fieldsToCompare.forEach((field) => {
    // Skip internal fields
    if (["_id", "__v", "createdAt", "updatedAt", "password", "token"].includes(field)) {
      return;
    }

    const originalValue = original[field];
    const updatedValue = updated[field];

    // Handle category field specially - compare IDs
    if (field === "category" || field === "categoryId") {
      const originalId = typeof originalValue === "object" ? originalValue?._id?.toString() : originalValue?.toString();
      const updatedId = typeof updatedValue === "object" ? updatedValue?._id?.toString() : updatedValue?.toString();
      
      if (originalId !== updatedId) {
        changes.push(field);
      }
      return;
    }

    // Handle nested objects
    if (typeof updatedValue === "object" && updatedValue !== null && !Array.isArray(updatedValue)) {
      // For objects, compare stringified versions
      const originalStr = JSON.stringify(originalValue || {});
      const updatedStr = JSON.stringify(updatedValue);
      
      if (originalStr !== updatedStr) {
        changes.push(field);
      }
    } else if (Array.isArray(updatedValue)) {
      // For arrays, compare stringified versions
      const originalStr = JSON.stringify(originalValue || []);
      const updatedStr = JSON.stringify(updatedValue);
      
      if (originalStr !== updatedStr) {
        changes.push(field);
      }
    } else {
      // For simple values, direct comparison
      if (originalValue !== updatedValue) {
        changes.push(field);
      }
    }
  });

  return changes;
};

// Create a new profile update request
exports.createProfileUpdateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const files = req.files;

    // Get current vendor data (with populated category)
    const vendor = await vendorModel.findById(id).populate('category', 'name');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Duplicate number validation for profile edit request
    const nextNumbers = {
      phone: updateData.phone !== undefined ? normalizePhone(updateData.phone) : normalizePhone(vendor.phone),
      whatsappNumber:
        updateData.whatsappNumber !== undefined
          ? normalizePhone(updateData.whatsappNumber)
          : normalizePhone(vendor.whatsappNumber),
      alternatePhone:
        updateData.alternatePhone !== undefined
          ? normalizePhone(updateData.alternatePhone)
          : normalizePhone(vendor.alternatePhone),
    };

    const conflictingVendor = await findVendorByAnyNumber(
      [nextNumbers.phone, nextNumbers.whatsappNumber, nextNumbers.alternatePhone],
      id
    );

    if (conflictingVendor) {
      const conflictFields = getConflictingInputFields(nextNumbers, conflictingVendor);
      return res.status(400).json({
        success: false,
        message: buildDuplicateNumberMessage(conflictFields),
        errorType: "DUPLICATE_VENDOR_NUMBER",
        duplicateFields: conflictFields,
      });
    }

    // Transform nested objects (same as updateVendorProfileCtrl)
    if (updateData['experience[fields]'] || updateData['experience[totalYears]']) {
      updateData.experience = {
        fields: updateData['experience[fields]']
          ? Array.isArray(updateData['experience[fields]'])
            ? updateData['experience[fields]']
            : [updateData['experience[fields]']]
          : [],
        totalYears: updateData['experience[totalYears]']
          ? Number(updateData['experience[totalYears]'])
          : 0,
      };
      delete updateData['experience[fields]'];
      delete updateData['experience[totalYears]'];
    }

    if (updateData['bankDetail[accountNumber]'] || updateData['bankDetail[IFSC]'] ||
        updateData['bankDetail[accountHolderName]'] || updateData['bankDetail[branch]']) {
      updateData.bankDetail = {
        accountNumber: updateData['bankDetail[accountNumber]'] || '',
        IFSC: updateData['bankDetail[IFSC]'] || '',
        accountHolderName: updateData['bankDetail[accountHolderName]'] || '',
        branch: updateData['bankDetail[branch]'] || '',
      };
      delete updateData['bankDetail[accountNumber]'];
      delete updateData['bankDetail[IFSC]'];
      delete updateData['bankDetail[accountHolderName]'];
      delete updateData['bankDetail[branch]'];
    }

    // Normalize category field for comparison
    // If category in updateData is same as vendor's category ID, don't include it
    if (updateData.category) {
      const vendorCategoryId = vendor.category?._id?.toString() || vendor.category?.toString();
      const updateCategoryId = updateData.category.toString();
      
      if (vendorCategoryId === updateCategoryId) {
        delete updateData.category;
      }
    }

    // Get changed fields
    const changedFields = getChangedFields(vendor.toObject(), updateData);

    if (changedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes detected",
      });
    }

    // Clean up empty strings and portfolio images from updateData before saving
    const cleanedUpdateData = {};
    const cleanedChangedFields = [];
    
    Object.keys(updateData).forEach((key) => {
      // Skip portfolioImages completely - not needed in profile updates
      if (key === 'portfolioImages') {
        return;
      }
      
      const value = updateData[key];
      // Skip empty strings and undefined values
      if (value !== '' && value !== undefined && value !== null) {
        cleanedUpdateData[key] = value;
        // Only include in changedFields if it's actually being kept
        if (changedFields.includes(key)) {
          cleanedChangedFields.push(key);
        }
      }
    });

    // Check if there's already a pending request
    const existingRequest = await VendorProfileUpdateRequest.findOne({
      vendorId: id,
      status: "pending",
    });

    if (existingRequest) {
      // Update existing request
      existingRequest.requestedChanges = cleanedUpdateData;
      existingRequest.changedFields = cleanedChangedFields;
      await existingRequest.save();

      // Update vendor status
      await vendorModel.findByIdAndUpdate(id, {
        updateProfileRequest: "requested",
      });

      await createSystemLog({
        actorId: req.user?.id || null,
        actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
        entityId: existingRequest._id,
        entityModel: "VendorProfileUpdateRequest",
        action: "UPDATE",
        description: `Profile update request modified`,
      });

      return res.status(200).json({
        success: true,
        message: "Profile update request updated successfully",
        request: existingRequest,
      });
    }

    // Create new request
    const updateRequest = await VendorProfileUpdateRequest.create({
      vendorId: id,
      requestedChanges: cleanedUpdateData,
      originalData: vendor.toObject(),
      changedFields: cleanedChangedFields,
      status: "pending",
    });

    // Update vendor status
    await vendorModel.findByIdAndUpdate(id, {
      updateProfileRequest: "requested",
    });

    await createSystemLog({
      actorId: req.user?.id || null,
      actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
      entityId: updateRequest._id,
      entityModel: "VendorProfileUpdateRequest",
      action: "CREATE",
      description: `Profile update request submitted`,
    });

    return res.status(201).json({
      success: true,
      message: "Profile update request submitted successfully",
      request: updateRequest,
    });
  } catch (error) {
    console.error("❌ Error creating profile update request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create profile update request",
      error: error.message,
    });
  }
};

// Get all pending profile update requests
exports.getPendingUpdateRequests = async (req, res) => {
  try {
    const requests = await VendorProfileUpdateRequest.find({
      status: "pending",
    })
      .populate("vendorId", "name email phone company")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
      error: error.message,
    });
  }
};

// Get update request by vendor ID
exports.getUpdateRequestByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const request = await VendorProfileUpdateRequest.findOne({
      vendorId,
      status: "pending",
    }).populate("vendorId", "name email phone company");

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Error fetching update request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch update request",
      error: error.message,
    });
  }
};

// Approve profile update request
exports.approveUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminId } = req.body;

    const updateRequest = await VendorProfileUpdateRequest.findById(requestId);
    if (!updateRequest) {
      return res.status(404).json({
        success: false,
        message: "Update request not found",
      });
    }

    if (updateRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    // Get the vendor
    const vendor = await vendorModel.findById(updateRequest.vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Apply each changed field individually
    const requestedChanges = updateRequest.requestedChanges;
    
    // Build update object - only include fields we want to update
    const updateObject = {
      updateProfileRequest: "approved"
    };
    
    // Fields that should not be updated as simple fields (handled separately)
    const fieldsToSkip = ['bankDetail', 'experience'];
    
    // Process simple fields
    Object.keys(requestedChanges).forEach((key) => {
      if (!fieldsToSkip.includes(key)) {
        const value = requestedChanges[key];
        
        // Skip empty strings for any field
        if (typeof value === 'string' && value.trim() === '') {
          return;
        }
        
        // Skip undefined, null, or empty array values
        if (value === undefined || value === null) {
          return;
        }
        
        const sanitizedValue = sanitizeRequestedValue(key, value);
        if (sanitizedValue !== undefined) {
          updateObject[key] = sanitizedValue;
        }
      }
    });

    // Handle nested objects
    if (requestedChanges.bankDetail && typeof requestedChanges.bankDetail === 'object' && !Array.isArray(requestedChanges.bankDetail)) {
      updateObject.bankDetail = {
        ...vendor.bankDetail,
        ...requestedChanges.bankDetail,
      };
    }

    if (requestedChanges.experience && typeof requestedChanges.experience === 'object' && !Array.isArray(requestedChanges.experience)) {
      updateObject.experience = {
        ...vendor.experience,
        ...requestedChanges.experience,
      };
    }

    // Use findByIdAndUpdate to only update specified fields (avoids portfolioImages validation)
    const updatedVendor = await vendorModel.findByIdAndUpdate(
      updateRequest.vendorId,
      updateObject,
      { new: true, runValidators: false } // Skip validators to avoid portfolioImages issue
    );

    // Update request status
    updateRequest.status = "approved";
    updateRequest.reviewedBy = adminId;
    updateRequest.reviewedAt = new Date();
    await updateRequest.save();

    await createSystemLog({
      actorId: adminId || req.user?.id || null,
      actorModel: "auth",
      entityId: updateRequest._id,
      entityModel: "VendorProfileUpdateRequest",
      action: "STATUS_CHANGE",
      description: `Profile update request approved`,
    });

    return res.status(200).json({
      success: true,
      message: "Profile update request approved successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("❌ Error approving update request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve update request",
      error: error.message,
    });
  }
};

// Reject profile update request
exports.rejectUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminId, reason } = req.body;

    const updateRequest = await VendorProfileUpdateRequest.findById(requestId);
    if (!updateRequest) {
      return res.status(404).json({
        success: false,
        message: "Update request not found",
      });
    }

    if (updateRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    // Update request status
    updateRequest.status = "rejected";
    updateRequest.reviewedBy = adminId;
    updateRequest.reviewedAt = new Date();
    updateRequest.rejectionReason = reason;
    await updateRequest.save();

    // Reset vendor status
    await vendorModel.findByIdAndUpdate(updateRequest.vendorId, {
      updateProfileRequest: "approved", // Reset to approved so they can edit again
    });

    await createSystemLog({
      actorId: adminId || req.user?.id || null,
      actorModel: "auth",
      entityId: updateRequest._id,
      entityModel: "VendorProfileUpdateRequest",
      action: "STATUS_CHANGE",
      description: `Profile update request rejected`,
    });

    return res.status(200).json({
      success: true,
      message: "Profile update request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting update request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject update request",
      error: error.message,
    });
  }
};
