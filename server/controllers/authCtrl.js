const bcrypt = require("bcryptjs");
const authModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
const Contact = require("../models/contactModel");




const registerCtrl = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      type = "user",
      role = "user",
      isVendor,
      isBlog,
      isUser,
      isSupport,
      isJob,
      isAds,
      isBooking,
      isEmpManage,
      isCategoryManage,
      isManageService,
    } = req.body;

    if (!name || !email || !phone || !password || !type || !role) {
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

    const user = await authModel.create({
      name,
      email,
      password: hashedPassword,
      type,
      phone,
      role,
      isVendor: isVendor || false,
      isBlog: isBlog || false,
      isUser: isUser || false,
      isSupport: isSupport || false,
      isJob: isJob || false,
      isAds: isAds || false,
      isBooking: isBooking || false,
      isEmpManage: isEmpManage || false,
      isCategoryManage: isCategoryManage || false,
      isManageService: isManageService || false,
    });

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET
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
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET
      );

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
    const users = await authModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


const deleteAuthCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await authModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

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
      isSupport,
      isJob,
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

    // ✅ Update all permissions safely using nullish coalescing (??)
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.type = type ?? user.type;

    user.isVendor = isVendor ?? user.isVendor;
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
    const { id } = req.params;       // user id from URL
    const { type } = req.body;       // new type from body
    console.log(req.body)
    if (!id || !type) {
      return res.status(400).json({ message: "User ID and type are required" });
    }

    const user = await authModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.type = type;
    await user.save();
    console.log(user)

    return res.status(200).json({
      success: true,
      message: "User type updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user type:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
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
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
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

module.exports = {
  registerCtrl,
  loginCtrl,
  getAllUsers,
  editPermissionCtrl,
  deleteAuthCtrl,
  getUserInquiries,
  changeUserTypeCtrl,
  changePasswordCtrl
};
