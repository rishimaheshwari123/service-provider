const VendorProfileUpdateRequest = require("../models/vendorProfileUpdateRequestModel");
const vendorModel = require("../models/vendorModel");

// Helper function to get changed fields
const getChangedFields = (original, updated) => {
  const changes = [];
  const fieldsToCompare = Object.keys(updated);

  console.log("\n🔍 ===== COMPARING FIELDS =====");
  console.log("📋 Original data keys:", Object.keys(original));
  console.log("📋 Updated data keys:", fieldsToCompare);

  fieldsToCompare.forEach((field) => {
    // Skip internal fields
    if (["_id", "__v", "createdAt", "updatedAt", "password", "token"].includes(field)) {
      return;
    }

    const originalValue = original[field];
    const updatedValue = updated[field];

    console.log(`\n🔍 Checking field: ${field}`);
    console.log(`  Original type: ${typeof originalValue}, value:`, originalValue);
    console.log(`  Updated type: ${typeof updatedValue}, value:`, updatedValue);

    // Handle category field specially - compare IDs
    if (field === "category" || field === "categoryId") {
      const originalId = typeof originalValue === "object" ? originalValue?._id?.toString() : originalValue?.toString();
      const updatedId = typeof updatedValue === "object" ? updatedValue?._id?.toString() : updatedValue?.toString();
      
      console.log(`  📌 Category comparison:`);
      console.log(`    Original ID: ${originalId}`);
      console.log(`    Updated ID: ${updatedId}`);
      console.log(`    Match: ${originalId === updatedId}`);
      
      if (originalId !== updatedId) {
        console.log(`  ✅ CHANGED: ${field}`);
        changes.push(field);
      } else {
        console.log(`  ⏭️  SKIPPED: ${field} (no change)`);
      }
      return;
    }

    // Handle nested objects
    if (typeof updatedValue === "object" && updatedValue !== null && !Array.isArray(updatedValue)) {
      // For objects, compare stringified versions
      const originalStr = JSON.stringify(originalValue || {});
      const updatedStr = JSON.stringify(updatedValue);
      
      console.log(`  📦 Object comparison:`);
      console.log(`    Original JSON: ${originalStr.substring(0, 100)}...`);
      console.log(`    Updated JSON: ${updatedStr.substring(0, 100)}...`);
      console.log(`    Match: ${originalStr === updatedStr}`);
      
      if (originalStr !== updatedStr) {
        console.log(`  ✅ CHANGED: ${field}`);
        changes.push(field);
      } else {
        console.log(`  ⏭️  SKIPPED: ${field} (no change)`);
      }
    } else if (Array.isArray(updatedValue)) {
      // For arrays, compare stringified versions
      const originalStr = JSON.stringify(originalValue || []);
      const updatedStr = JSON.stringify(updatedValue);
      
      console.log(`  📚 Array comparison:`);
      console.log(`    Match: ${originalStr === updatedStr}`);
      
      if (originalStr !== updatedStr) {
        console.log(`  ✅ CHANGED: ${field}`);
        changes.push(field);
      } else {
        console.log(`  ⏭️  SKIPPED: ${field} (no change)`);
      }
    } else {
      // For simple values, direct comparison
      console.log(`  🔤 Simple comparison:`);
      console.log(`    Match: ${originalValue === updatedValue}`);
      
      if (originalValue !== updatedValue) {
        console.log(`  ✅ CHANGED: ${field}`);
        changes.push(field);
      } else {
        console.log(`  ⏭️  SKIPPED: ${field} (no change)`);
      }
    }
  });

  console.log("\n✅ ===== FINAL CHANGED FIELDS =====");
  console.log(changes);
  console.log("================================\n");

  return changes;
};

// Create a new profile update request
exports.createProfileUpdateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const files = req.files;

    console.log("📋 Profile update request received for vendor:", id);
    console.log("📄 Files received:", files ? Object.keys(files) : "No files");
    console.log("📝 Form data keys:", Object.keys(updateData));

    // Get current vendor data (with populated category)
    const vendor = await vendorModel.findById(id).populate('category', 'name');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    console.log("📋 Original vendor category:", vendor.category);
    console.log("📋 Update data category:", updateData.category);

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
    console.log("\n🔍 ===== CATEGORY NORMALIZATION =====");
    console.log("📋 updateData.category:", updateData.category);
    console.log("📋 vendor.category:", vendor.category);
    
    if (updateData.category) {
      const vendorCategoryId = vendor.category?._id?.toString() || vendor.category?.toString();
      const updateCategoryId = updateData.category.toString();
      
      console.log("🔍 Comparing categories:");
      console.log("  Vendor category ID:", vendorCategoryId);
      console.log("  Update category ID:", updateCategoryId);
      console.log("  Are they equal?", vendorCategoryId === updateCategoryId);
      
      if (vendorCategoryId === updateCategoryId) {
        console.log("✅ Category unchanged, removing from update data");
        delete updateData.category;
      } else {
        console.log("⚠️  Category HAS CHANGED - keeping in update data");
      }
    } else {
      console.log("ℹ️  No category in updateData");
    }
    console.log("📋 updateData after normalization:", Object.keys(updateData));
    console.log("================================\n");

    // Get changed fields
    const changedFields = getChangedFields(vendor.toObject(), updateData);

    if (changedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes detected",
      });
    }

    console.log("✅ Changed fields:", changedFields);

    // Check if there's already a pending request
    const existingRequest = await VendorProfileUpdateRequest.findOne({
      vendorId: id,
      status: "pending",
    });

    if (existingRequest) {
      // Update existing request
      existingRequest.requestedChanges = updateData;
      existingRequest.changedFields = changedFields;
      await existingRequest.save();

      // Update vendor status
      await vendorModel.findByIdAndUpdate(id, {
        updateProfileRequest: "requested",
      });

      console.log("✅ Updated existing profile update request");

      return res.status(200).json({
        success: true,
        message: "Profile update request updated successfully",
        request: existingRequest,
      });
    }

    // Create new request
    const updateRequest = await VendorProfileUpdateRequest.create({
      vendorId: id,
      requestedChanges: updateData,
      originalData: vendor.toObject(),
      changedFields,
      status: "pending",
    });

    // Update vendor status
    await vendorModel.findByIdAndUpdate(id, {
      updateProfileRequest: "requested",
    });

    console.log("✅ Created new profile update request");

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

    console.log("📋 Approving update request:", requestId);

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

    console.log("📝 Requested changes:", updateRequest.requestedChanges);
    console.log("🔄 Changed fields:", updateRequest.changedFields);

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
    
    // Update simple fields
    Object.keys(requestedChanges).forEach((key) => {
      if (key !== 'bankDetail' && key !== 'experience') {
        vendor[key] = requestedChanges[key];
      }
    });

    // Update nested objects properly
    if (requestedChanges.bankDetail) {
      vendor.bankDetail = {
        ...vendor.bankDetail,
        ...requestedChanges.bankDetail,
      };
    }

    if (requestedChanges.experience) {
      vendor.experience = {
        ...vendor.experience,
        ...requestedChanges.experience,
      };
    }

    // Set approval status
    vendor.updateProfileRequest = "approved";

    // Save the vendor with all changes
    await vendor.save();

    console.log("✅ Vendor profile updated successfully");

    // Update request status
    updateRequest.status = "approved";
    updateRequest.reviewedBy = adminId;
    updateRequest.reviewedAt = new Date();
    await updateRequest.save();

    console.log("✅ Update request marked as approved");

    return res.status(200).json({
      success: true,
      message: "Profile update request approved successfully",
      vendor: vendor,
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
