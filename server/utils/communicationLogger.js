const CommunicationLogs = require("../models/communicationLogs");

/**
 * Log communication (SMS/WhatsApp/Email)
 * @param {Object} logData - Communication log data
 * @returns {Promise} - Saved log document
 */
const logCommunication = async (logData) => {
  try {
    const log = await CommunicationLogs.create(logData);
    console.log(`📝 Communication logged: ${logData.type} - ${logData.purpose}`);
    return log;
  } catch (error) {
    console.error("❌ Error logging communication:", error);
    // Don't throw error - logging should not break the main flow
    return null;
  }
};

/**
 * Log SMS
 */
const logSMS = async ({ phone, name, message, purpose, status, response, errorMessage, userId, vendorId }) => {
  return await logCommunication({
    type: "SMS",
    purpose,
    recipient: { phone, name },
    userId,
    vendorId,
    message,
    status,
    response,
    errorMessage,
    provider: "Niyati SMS Gateway",
    cost: status === "Success" ? 0.25 : 0, // Approximate cost per SMS
  });
};

/**
 * Log WhatsApp
 */
const logWhatsApp = async ({ phone, name, message, purpose, status, response, errorMessage, userId, vendorId }) => {
  return await logCommunication({
    type: "WhatsApp",
    purpose,
    recipient: { phone, name },
    userId,
    vendorId,
    message,
    status,
    response,
    errorMessage,
    provider: "MSG24 WhatsApp API",
    cost: status === "Success" ? 0.10 : 0, // Approximate cost per WhatsApp message
  });
};

/**
 * Log Email
 */
const logEmail = async ({ email, name, message, purpose, status, response, errorMessage, userId, vendorId }) => {
  return await logCommunication({
    type: "Email",
    purpose,
    recipient: { email, name },
    userId,
    vendorId,
    message,
    status,
    response,
    errorMessage,
    provider: "Nodemailer",
    cost: 0, // Email is typically free
  });
};

module.exports = {
  logCommunication,
  logSMS,
  logWhatsApp,
  logEmail,
};
