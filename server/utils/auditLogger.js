const SystemAuditLog = require("../models/systemAuditLog");

/**
 * Creates a system audit log entry
 * @param {Object} params - The log parameters
 */
const createSystemLog = async ({
  actorId,
  actorModel,
  entityId,
  entityModel,
  action,
  description,
  oldData = null,
  newData = null,
  req = null, // To extract IP and User-Agent
}) => {
  try {
    const ipAddress = req ? req.ip || req.connection.remoteAddress : undefined;
    const userAgent = req ? req.headers["user-agent"] : undefined;

    await SystemAuditLog.create({
      actorId,
      actorModel,
      entityId,
      entityModel,
      action,
      description,
      changes: { oldData, newData },
      ipAddress,
      userAgent,
    });

    // Console log for development (optional)
    console.log(`[AUDIT] ${action} on ${entityModel}: ${description}`);
  } catch (error) {
    // We catch the error so that the main application logic DOES NOT break
    // even if logging fails temporarily.
    console.error("❌ System Audit Log Error:", error);
  }
};

module.exports = createSystemLog;
