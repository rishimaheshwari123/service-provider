const mongoose = require("mongoose");

const systemAuditLogSchema = new mongoose.Schema(
  {
    // 1. KISNE ACTION PERFORM KIYA (Actor)
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "actorModel", // Dynamic reference
    },
    actorModel: {
      type: String,
      required: true,
      enum: ["auth", "Vendor"], // Action kon le raha hai (Admin/User ya Vendor)
    },

    // 2. KIS ENTITY PAR ACTION HUA (Target/Entity)
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityModel", // Dynamic reference
    },
    entityModel: {
      type: String,
      required: true,
      enum: ["auth", "Vendor", "Category", "Property", "System", "Ads"], // Kis model me change hua
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

module.exports = mongoose.model("SystemAuditLog", systemAuditLogSchema);
