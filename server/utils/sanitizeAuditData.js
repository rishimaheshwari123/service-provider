const sanitizeAuditData = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };

  delete data.password;
  delete data.token;
  delete data.fcmToken;
  delete data.resetPasswordOTP;
  delete data.resetPasswordOTPExpiry;
  delete data.phoneVerificationOTP;
  delete data.phoneVerificationOTPExpiry;

  return data;
};

module.exports = {
  sanitizeAuditData,
};
