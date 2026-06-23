const bcrypt = require("bcryptjs");
const authModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
const Contact = require("../models/contactModel");
const createSystemLog = require("../utils/auditLogger");
const { sanitizeAuditData } = require("../utils/sanitizeAuditData");

const registerCtrl = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      type = "active",
      role = "user",
      referralCode,
      isVendor,
      isBlog,
      isUser,
      isSupport,
      isLogs,
      isJob,
      isAds,
      isBooking,
      isEmpManage,
      isCoupen,
      isCategoryManage,
      isManageService,
    } = req.body;

    if (!name || !phone || !password || !type || !role) {
      return res.status(403).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const existingUser = await authModel.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle referral code if provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await authModel.findOne({
        referralCode: referralCode.toUpperCase(),
      });
      if (referrer) {
        referrerId = referrer._id;
      }
    }

    // Generate unique referral code for new user
    const { generateReferralCode } = require("../utils/rewardHelper");
    const newUserReferralCode = await generateReferralCode();

    const user = await authModel.create({
      name,
      email,
      password: hashedPassword,
      type,
      phone,
      role,
      referralCode: newUserReferralCode,
      referredBy: referrerId,
      referredByCode: referralCode ? referralCode.toUpperCase() : null,
      isVendor: isVendor || false,
      isLogs: isLogs || false,
      isBlog: isBlog || false,
      isUser: isUser || false,
      isSupport: isSupport || false,
      isJob: isJob || false,
      isAds: isAds || false,
      isBooking: isBooking || false,
      isEmpManage: isEmpManage || false,
      isCategoryManage: isCategoryManage || false,
      isCoupen: isCoupen || false,
      isManageService: isManageService || false,
    });

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "CREATE",
      description: `User ${user.name} registered`,
      newData: user.toObject(),
      req,
    });

    // Process referral rewards if user was referred
    if (referrerId) {
      const { processReferralReward } = require("../utils/rewardHelper");
      try {
        await processReferralReward(referrerId, user._id);
      } catch (error) {
        console.error("Error processing referral reward:", error);
        // Don't fail registration if reward processing fails
      }
    }

    const token = jwt.sign(
      { name: user.name, email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("token", token, options);

    return res.status(200).json({
      success: true,
      token,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

const createUserCtrl = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      type = "active",
      role = "user",
      referralCode,
      isVendor,
      isBlog,
      isUser,
      isSupport,
      isLogs,
      isJob,
      isAds,
      isBooking,
      isEmpManage,
      isCoupen,
      isCategoryManage,
      isManageService,
    } = req.body;

    if (!name || !phone || !password || !type || !role) {
      return res.status(403).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const existingUser = await authModel.findOne({ phone });
    if (existingUser && !existingUser.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle referral code if provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await authModel.findOne({
        referralCode: referralCode.toUpperCase(),
      });
      if (referrer) {
        referrerId = referrer._id;
      }
    }

    // Generate unique referral code for new user
    const { generateReferralCode } = require("../utils/rewardHelper");
    const newUserReferralCode = await generateReferralCode();

    // =====================================
    // RESTORE SOFT DELETED USER
    // =====================================
    if (existingUser && existingUser.isDeleted) {
      const oldData = {
        isDeleted: existingUser.isDeleted,
      };

      existingUser.name = name;
      existingUser.email = email;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;
      existingUser.type = type;
      existingUser.role = role;

      existingUser.isDeleted = false;

      existingUser.isVendor = isVendor || false;
      existingUser.isLogs = isLogs || false;
      existingUser.isBlog = isBlog || false;
      existingUser.isUser = isUser || false;
      existingUser.isSupport = isSupport || false;
      existingUser.isJob = isJob || false;
      existingUser.isAds = isAds || false;
      existingUser.isBooking = isBooking || false;
      existingUser.isEmpManage = isEmpManage || false;
      existingUser.isCategoryManage = isCategoryManage || false;
      existingUser.isCoupen = isCoupen || false;
      existingUser.isManageService = isManageService || false;

      await existingUser.save();

      const auditUser = existingUser.toObject();

      delete auditUser.password;
      delete auditUser.token;
      delete auditUser.resetPasswordOTP;
      delete auditUser.phoneVerificationOTP;

      await createSystemLog({
        actorId: req.user._id || req.user.id,
        actorModel: "auth",

        entityId: existingUser._id,
        entityModel: "auth",

        action: "UPDATE",

        description: `Admin ${req.user.name} restored deleted user ${existingUser.name}`,

        oldData,

        newData: {
          isDeleted: false,
        },

        req,
      });

      return res.status(200).json({
        success: true,
        message: "Deleted user restored successfully.",
        user: existingUser,
      });
    }

    const user = await authModel.create({
      name,
      email,
      password: hashedPassword,
      type,
      phone,
      role,
      referralCode: newUserReferralCode,
      referredBy: referrerId,
      referredByCode: referralCode ? referralCode.toUpperCase() : null,
      isVendor: isVendor || false,
      isLogs: isLogs || false,
      isBlog: isBlog || false,
      isUser: isUser || false,
      isSupport: isSupport || false,
      isJob: isJob || false,
      isAds: isAds || false,
      isBooking: isBooking || false,
      isEmpManage: isEmpManage || false,
      isCategoryManage: isCategoryManage || false,
      isCoupen: isCoupen || false,
      isManageService: isManageService || false,
    });

    const actorId = req.user._id || req.user.id;

    await createSystemLog({
      actorId: actorId,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "CREATE",
      description: `User ${user.name} registered.`,
      newData: user.toObject(),
      req,
    });

    // Process referral rewards if user was referred
    if (referrerId) {
      const { processReferralReward } = require("../utils/rewardHelper");
      try {
        await processReferralReward(referrerId, user._id);
      } catch (error) {
        console.error("Error processing referral reward:", error);
        // Don't fail registration if reward processing fails
      }
    }

    return res.status(201).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

const loginCtrl = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await authModel.findOne({ phone });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { name: user.name, email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
      );

      await createSystemLog({
        actorId: user._id,
        actorModel: "auth",
        entityId: user._id,
        entityModel: "auth",
        action: "UPDATE",
        description: `User ${user.name} logged in`,
        newData: {
          loginAt: new Date(),
        },
        req,
      });

      user.token = token;
      user.password = undefined;
      const options = {
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = {};
    if (search && search.trim() !== "") {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Get total count for pagination
    const totalUsers = await authModel.countDocuments(searchQuery);

    // Get paginated users
    const users = await authModel
      .find({
        ...searchQuery,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("-password")
      .lean();

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        totalUsers,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const deleteAuthCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await authModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
        },
      },
      {
        new: true,
      },
    );

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await createSystemLog({
      actorId: req.user?._id || req.user?.id,
      actorModel: "auth",
      entityId: deletedUser._id,
      entityModel: "auth",
      action: "DELETE",
      description: `${req.user.name} deleted user ${deletedUser.name}.`,
      oldData: sanitizeAuditData(deletedUser),
      req,
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const editPermissionCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      type,
      isVendor,
      isBlog,
      isUser,
      isCoupen,
      isSupport,
      isJob,
      isLogs,
      isAds,
      isBooking,
      isEmpManage,
      isCategoryManage,
      isManageService,
    } = req.body;

    const user = await authModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldUser = user.toObject();

    // ✅ Update all permissions safely using nullish coalescing (??)
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.type = type ?? user.type;

    user.isVendor = isVendor ?? user.isVendor;
    user.isLogs = isLogs ?? user.isLogs;
    user.isCoupen = isCoupen ?? user.isCoupen;
    user.isBlog = isBlog ?? user.isBlog;
    user.isUser = isUser ?? user.isUser;
    user.isSupport = isSupport ?? user.isSupport;
    user.isJob = isJob ?? user.isJob;
    user.isAds = isAds ?? user.isAds;
    user.isBooking = isBooking ?? user.isBooking;
    user.isEmpManage = isEmpManage ?? user.isEmpManage;
    user.isCategoryManage = isCategoryManage ?? user.isCategoryManage;
    user.isManageService = isManageService ?? user.isManageService;

    await user.save();

    const newUser = user.toObject();

    await createSystemLog({
      actorId: req.user._id || req.user.id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `Admin ${req.user.name} updated permissions for ${user.name}`,
      oldData: sanitizeAuditData(oldUser),
      newData: sanitizeAuditData(newUser),
      req,
    });

    return res.status(200).json({
      success: true,
      message: "User permissions updated successfully",
      user,
    });
  } catch (error) {
    console.error("Permission update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update permissions",
    });
  }
};

const getUserInquiries = async (req, res) => {
  try {
    const { id } = req.params;

    // Check user exists
    const user = await authModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all inquiries for this user (as-is)
    const inquiries = await Contact.find({ user: id })
      .populate("vendor")
      .populate("user");

    // Return direct data
    return res.status(200).json({
      success: true,
      message: "User inquiries fetched successfully",
      user,
      inquiries,
    });
  } catch (error) {
    console.error("Error fetching user inquiries:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const changeUserTypeCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!id || !type) {
      return res.status(400).json({ message: "User ID and type are required" });
    }

    const user = await authModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const oldType = user.type;
    user.type = type;
    await user.save();

    await createSystemLog({
      actorId: req.user._id || req.user.id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `Admin ${req.user.name} changed user type for ${user.name} from ${oldType} to ${type}`,
      oldData: {
        type: oldType,
      },
      newData: {
        type: type,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "User type updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user type:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const changePasswordCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await authModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `${user.name} changed password`,
      newData: {
        passwordChanged: true,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// Forgot Password - Send OTP
const forgotPasswordCtrl = async (req, res) => {
  try {
    const { phone, otpMethod = "sms" } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if user exists
    const user = await authModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number",
      });
    }

    // Generate OTP
    const {
      generateOTP,
      sendSMSOTP,
      sendWhatsAppOTP,
    } = require("../utils/otpService");
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user (we'll add these fields to schema)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP based on method
    let otpResult;
    if (otpMethod === "whatsapp") {
      otpResult = await sendWhatsAppOTP(phone, otp, null, user._id, user.name);
    } else {
      otpResult = await sendSMSOTP(phone, otp, null, user._id, user.name);
    }

    if (otpResult.success) {
      await createSystemLog({
        actorId: user._id,
        actorModel: "auth",
        entityId: user._id,
        entityModel: "auth",
        action: "UPDATE",
        description: `${user.name} requested password reset OTP`,
        newData: {
          otpMethod,
        },
        req,
      });

      return res.status(200).json({
        success: true,
        message: `Password reset OTP sent via ${otpMethod.toUpperCase()}`,
        method: otpResult.method || otpMethod,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Verify OTP for Password Reset
const verifyResetOTPCtrl = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const user = await authModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists and is not expired
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    if (new Date() > user.resetPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `${user.name} verified password reset OTP`,
      newData: {
        otpVerified: true,
      },
      req,
    });

    // OTP is valid - generate a temporary token for password reset
    const resetToken = jwt.sign(
      { userId: user._id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Reset Password
const resetPasswordCtrl = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const user = await authModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `${user.name} reset password`,
      newData: {
        passwordReset: true,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Generate Referral Code for Existing Users
const generateReferralCodeCtrl = async (req, res) => {
  try {
    // Get userId from request body or from token (if middleware is used)
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await authModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already has a referral code
    if (user.referralCode) {
      return res.status(200).json({
        success: true,
        message: "User already has a referral code",
        referralCode: user.referralCode,
      });
    }

    // Generate unique referral code
    const { generateReferralCode } = require("../utils/rewardHelper");
    const referralCode = await generateReferralCode(userId);

    user.referralCode = referralCode;
    await user.save();

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `${user.name} generated referral code`,
      newData: {
        referralCode,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Referral code generated successfully",
      referralCode: referralCode,
    });
  } catch (error) {
    console.error("Generate referral code error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate referral code",
      error: error.message,
    });
  }
};

// Send Phone Verification OTP
const sendPhoneVerificationOTPCtrl = async (req, res) => {
  try {
    const { userId, otpMethod = "whatsapp" } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await authModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number not found for this user",
      });
    }

    // Check if phone is already verified
    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already verified",
      });
    }

    // Generate OTP
    const {
      generateOTP,
      sendSMSOTP,
      sendWhatsAppOTP,
    } = require("../utils/otpService");
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // Save OTP to user
    user.phoneVerificationOTP = otp;
    user.phoneVerificationOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP based on method
    let otpResult;
    if (otpMethod === "whatsapp") {
      otpResult = await sendWhatsAppOTP(
        user.phone,
        otp,
        null,
        user._id,
        user.name,
      );
    } else {
      otpResult = await sendSMSOTP(user.phone, otp, null, user._id, user.name);
    }

    if (otpResult.success) {
      await createSystemLog({
        actorId: user._id,
        actorModel: "auth",
        entityId: user._id,
        entityModel: "auth",
        action: "UPDATE",
        description: `${user.name} requested phone verification OTP via ${otpMethod || otpMethod}`,
        req,
      });

      return res.status(200).json({
        success: true,
        message: `Verification OTP sent via ${otpResult.method || otpMethod}`,
        method: otpResult.method || otpMethod,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: otpResult.message || "Failed to send OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Send phone verification OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Verify Phone Number with OTP
const verifyPhoneOTPCtrl = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    const user = await authModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if phone is already verified
    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already verified",
      });
    }

    // Check if OTP exists and is not expired
    if (!user.phoneVerificationOTP || !user.phoneVerificationOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    if (new Date() > user.phoneVerificationOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (user.phoneVerificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid - mark phone as verified
    user.phoneVerified = true;
    user.phoneVerificationOTP = undefined;
    user.phoneVerificationOTPExpiry = undefined;
    await user.save();

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `${user.name} verified phone number`,
      oldData: {
        phoneVerified: false,
      },
      newData: {
        phoneVerified: true,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    console.error("Verify phone OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Admin Reset User Password (No OTP Required)
const adminResetUserPasswordCtrl = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!userId || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID, new password, and confirm password are required",
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user
    const user = await authModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    await createSystemLog({
      actorId: req.user._id || req.user.id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `Admin ${req.user.name} reset password for user ${user.name}`,
      newData: { passwordReset: true },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "User password reset successfully by admin",
    });
  } catch (error) {
    console.error("Admin reset user password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

module.exports = {
  registerCtrl,
  createUserCtrl,
  loginCtrl,
  getAllUsers,
  editPermissionCtrl,
  deleteAuthCtrl,
  getUserInquiries,
  changeUserTypeCtrl,
  changePasswordCtrl,
  forgotPasswordCtrl,
  verifyResetOTPCtrl,
  resetPasswordCtrl,
  generateReferralCodeCtrl,
  sendPhoneVerificationOTPCtrl,
  verifyPhoneOTPCtrl,
  adminResetUserPasswordCtrl,
};

// FCM Token Management

/**
 * Save FCM token for a user
 */
const saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user._id;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    const user = await authModel.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `${user.name} updated FCM token`,
      req,
    });

    res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Error saving FCM token",
      error: error.message,
    });
  }
};

/**
 * Remove FCM token for a user (on logout)
 */
const removeFCMToken = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await authModel.findByIdAndUpdate(
      userId,
      { fcmToken: null },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await createSystemLog({
      actorId: user._id,
      actorModel: "auth",
      entityId: user._id,
      entityModel: "auth",
      action: "UPDATE",
      description: `${user.name} removed FCM token`,
      req,
    });

    res.status(200).json({
      success: true,
      message: "FCM token removed successfully",
    });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Error removing FCM token",
      error: error.message,
    });
  }
};

/**
 * Get user notification preferences
 */
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await authModel
      .findById(userId)
      .select("notificationPreferences");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.notificationPreferences || {
        bookingUpdates: true,
        promotions: true,
        reminders: true,
        general: true,
      },
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notification preferences",
      error: error.message,
    });
  }
};

/**
 * Update user notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingUpdates, promotions, reminders, general } = req.body;

    const updateData = {};
    if (typeof bookingUpdates === "boolean")
      updateData["notificationPreferences.bookingUpdates"] = bookingUpdates;
    if (typeof promotions === "boolean")
      updateData["notificationPreferences.promotions"] = promotions;
    if (typeof reminders === "boolean")
      updateData["notificationPreferences.reminders"] = reminders;
    if (typeof general === "boolean")
      updateData["notificationPreferences.general"] = general;

    const user = await authModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification preferences",
      error: error.message,
    });
  }
};

module.exports = {
  ...module.exports,
  saveFCMToken,
  removeFCMToken,
  getNotificationPreferences,
  updateNotificationPreferences,
};
