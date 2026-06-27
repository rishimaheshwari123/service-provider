const mongoose = require("mongoose");

const systemAuditLogSchema = new mongoose.Schema(
  {
    // 1. KISNE ACTION PERFORM KIYA (Actor)
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "actorModel", // Dynamic reference
    },
    actorModel: {
      type: String,
      required: false,
      enum: ["auth", "Vendor", "CustomerSupport"], // Action kon le raha hai (Admin/User ya Vendor)
    },

    // 2. KIS ENTITY PAR ACTION HUA (Target/Entity)
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "entityModel", // Dynamic reference
    },
    entityModel: {
      type: String,
      required: true,
      enum: [
        "auth", "Vendor", "Category", "Property", "System", "Ads", "Blog", 
        "Career", "Coupon", "Contact", "CustomerSupport", "Job", 
        "Notification", "VendorCategoryPurchase", "PriceKeyFeatures", 
        "RatingAndReview", "RewardSettings", "RewardPoints", "RewardHistory", 
        "RedeemCode", "ServiceUpdateRequest", "VendorProfileUpdateRequest",
        "Device", "CommunicationLogs", "Topic"
      ],
    },

    // 3. KYA ACTION HUA
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "APPROVE",
        "REJECT",
        "BLOCK",
        "UNBLOCK",
        "STATUS_CHANGE",
      ],
      required: true,
    },

    // 4. DETAILS KYA HAIN (Old vs New Data for Updates)
    changes: {
      oldData: { type: Object, default: null },
      newData: { type: Object, default: null },
    },

    description: {
      type: String,
      trim: true,
      // Example: "Admin Rahul updated Category 'Plumbing' price from 500 to 600"
    },

    // 5. METADATA
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true },
);

// Indexes for faster querying in backend admin panel
systemAuditLogSchema.index({ entityModel: 1, entityId: 1 });
systemAuditLogSchema.index({ actorId: 1 });
systemAuditLogSchema.index({ action: 1 });
systemAuditLogSchema.index({ createdAt: -1 });

// Prevent MissingSchemaError when populating generic system logs
if (!mongoose.models.System) {
  mongoose.model("System", new mongoose.Schema({ name: String, email: String }, { strict: false }));
}

module.exports = mongoose.model("SystemAuditLog", systemAuditLogSchema);
