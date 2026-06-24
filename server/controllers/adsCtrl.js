const { uploadImageToCloudinary } = require("../config/s3Uploader");
const adsModel = require("../models/adsModel");
const createSystemLog = require("../utils/auditLogger");

let legacyAdsMigrated = false;

const migrateLegacyAdsAsAdmin = async () => {
  if (legacyAdsMigrated) return;

  await adsModel.updateMany(
    {
      $or: [
        { createdByType: { $exists: false } },
        { approvalStatus: { $exists: false } },
        { isActive: { $exists: false } },
      ],
    },
    {
      $set: {
        createdByType: "admin",
        approvalStatus: "approved",
        isActive: true,
      },
      $setOnInsert: {
        adminId: null,
      },
    },
  );

  legacyAdsMigrated = true;
};

const createAdminAdCtrl = async (req, res) => {
  try {
    const { url } = req.body;
    const adminId = req.user.id || req.user._id;
    const image = req.files?.image;

    if (!url || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide url and image",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      image,
      process.env.FOLDER_NAME,
    );

    const ad = await adsModel.create({
      image: thumbnailImage.secure_url,
      url,
      createdByType: "admin",
      adminId: adminId,
      approvalStatus: "approved",
      isActive: true,
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectionReason: "",
    });

    await createSystemLog({
      actorId: req.user.id,
      actorModel: "auth",
      entityId: ad._id,
      entityModel: "Ads",
      action: "CREATE",
      description: `Admin ${req.user.name} created advertisement`,
      newData: {
        url: ad.url,
        image: ad.image,
        createdByType: ad.createdByType,
        approvalStatus: ad.approvalStatus,
        isActive: ad.isActive,
      },
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Admin ad created and activated successfully!",
      ad,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating admin ad",
      error: error.message,
    });
  }
};

const createVendorAdCtrl = async (req, res) => {
  try {
    const { url } = req.body;
    const image = req.files?.image;
    const vendorId = req.user.id;

    if (!url || !image || !vendorId) {
      return res.status(400).json({
        success: false,
        message: "Please provide url, image and vendorId",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      image,
      process.env.FOLDER_NAME,
    );

    const ad = await adsModel.create({
      image: thumbnailImage.secure_url,
      url,
      createdByType: "vendor",
      vendorId,
      approvalStatus: "pending",
      isActive: false,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: "",
    });

    await createSystemLog({
      actorId: vendorId,
      actorModel: "Vendor",
      entityId: ad._id,
      entityModel: "Ads",
      action: "CREATE",
      description: `Vendor submitted advertisement for approval`,
      newData: {
        url: ad.url,
        image: ad.image,
        approvalStatus: ad.approvalStatus,
      },
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Vendor ad submitted for admin approval",
      ad,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating vendor ad",
      error: error.message,
    });
  }
};

// Public ads endpoint: only approved + active ads
const getAllAds = async (req, res) => {
  try {
    await migrateLegacyAdsAsAdmin();
    const ads = await adsModel
      .find({ approvalStatus: "approved", isActive: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      ads,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching active ads",
      error: error.message,
    });
  }
};

// Admin management endpoint
const getManageAds = async (req, res) => {
  try {
    await migrateLegacyAdsAsAdmin();
    const { createdByType, approvalStatus } = req.query;
    const filter = {};

    if (createdByType && ["admin", "vendor"].includes(createdByType)) {
      filter.createdByType = createdByType;
    }

    if (
      approvalStatus &&
      ["pending", "approved", "rejected"].includes(approvalStatus)
    ) {
      filter.approvalStatus = approvalStatus;
    }

    const ads = await adsModel
      .find(filter)
      .populate("vendorId", "name phone company email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      ads,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching ads for management",
      error: error.message,
    });
  }
};

// Vendor endpoint: get own ads
const getVendorAds = async (req, res) => {
  try {
    await migrateLegacyAdsAsAdmin();
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "vendorId is required",
      });
    }

    const ads = await adsModel
      .find({ vendorId, createdByType: "vendor" })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      ads,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching vendor ads",
      error: error.message,
    });
  }
};

const approveVendorAdCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id || req.user.id;

    const ad = await adsModel.findById(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    if (ad.createdByType !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "Only vendor ads can be approved/rejected",
      });
    }

    ad.approvalStatus = "approved";
    ad.isActive = true;
    ad.approvedBy = adminId;
    ad.approvedAt = new Date();
    ad.rejectionReason = "";
    await ad.save();

    await createSystemLog({
      actorId: adminId,
      actorModel: "Vendor",
      entityId: ad._id,
      entityModel: "Ads",
      action: "APPROVE",
      description: `Admin ${req.user.name} approved ad`,
      oldData: {
        approvalStatus: "pending",
        isActive: false,
      },
      newData: {
        approvalStatus: "approved",
        isActive: true,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Vendor ad approved and activated successfully!",
      ad,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving vendor ad",
      error: error.message,
    });
  }
};

const rejectVendorAdCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id || req.user.id;

    const ad = await adsModel.findById(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    if (ad.createdByType !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "Only vendor ads can be approved/rejected",
      });
    }

    ad.approvalStatus = "rejected";
    ad.isActive = false;
    ad.approvedBy = adminId || null;
    ad.approvedAt = new Date();
    ad.rejectionReason = reason || "Rejected by admin";
    await ad.save();

    await createSystemLog({
      actorId: adminId,
      actorModel: "Vendor",
      entityId: ad._id,
      entityModel: "Ads",
      action: "REJECT",
      description: `Admin ${req.user.name} rejected ad`,
      oldData: {
        approvalStatus: "pending",
      },
      newData: {
        approvalStatus: "rejected",
        rejectionReason: reason,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Vendor ad rejected",
      ad,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error rejecting vendor ad",
      error: error.message,
    });
  }
};

const toggleAdStatusCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const ad = await adsModel.findById(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    ad.isActive = Boolean(isActive);
    await ad.save();

    await createSystemLog({
      actorId: req.user._id || req.user.id,
      actorModel: "Vendor",
      entityId: ad._id,
      entityModel: "Ads",
      action: "STATUS_CHANGE",
      description: `Admin ${req.user.name} ${ad.isActive ? "activated" : "deactivated"} ad`,
      oldData: {
        isActive: !ad.isActive,
      },
      newData: {
        isActive: ad.isActive,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Ad ${ad.isActive ? "activated" : "deactivated"} successfully`,
      ad,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling ad status",
      error: error.message,
    });
  }
};

const deleteAddCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await adsModel.findById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    await createSystemLog({
      actorId: req.user.id,
      actorModel: "auth",
      entityId: ad._id,
      entityModel: "Ads",

      action: "DELETE",

      description: `Advertisement deleted`,

      oldData: {
        url: ad.url,
        image: ad.image,
        approvalStatus: ad.approvalStatus,
        isActive: ad.isActive,
      },

      req,
    });

    await adsModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Ad deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting ad",
      error: error.message,
    });
  }
};

const updateAddCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body;
    const image = req.files?.image;

    const ad = await adsModel.findById(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    const oldAd = ad.toObject();

    const updateData = {};
    if (url) updateData.url = url;

    if (image) {
      const thumbnailImage = await uploadImageToCloudinary(
        image,
        process.env.FOLDER_NAME,
      );
      updateData.image = thumbnailImage.secure_url;
    }

    const updatedAd = await adsModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    await createSystemLog({
      actorId: req.user.id,
      actorModel: "auth",
      entityId: ad._id,
      entityModel: "Ads",
      action: "UPDATE",
      description: `Advertisement updated`,
      oldData: {
        url: oldAd.url,
        image: oldAd.image,
      },
      newData: {
        url: updatedAd.url,
        image: updatedAd.image,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Ad updated successfully!",
      ad: updatedAd,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating ad",
      error: error.message,
    });
  }
};

module.exports = {
  createAdminAdCtrl,
  createVendorAdCtrl,
  getAllAds,
  getManageAds,
  getVendorAds,
  approveVendorAdCtrl,
  rejectVendorAdCtrl,
  toggleAdStatusCtrl,
  deleteAddCtrl,
  updateAddCtrl,
};
