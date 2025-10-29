const bcrypt = require("bcryptjs");
const authModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
const Contact = require("../models/contactModel");




const registerCtrl = async (req, res) => {
  try {
    const {
      name, email, password, isvendor, isProperties, isInquiry, isBlog, isAppicatoin, isJob, type
    } = req.body;

    if (!name || !email || !password) {
      return res.status(403).send({
        success: false,
        message: "All required fields must be filled",
      });
    }


    const existingUser = await authModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authModel.create({
      name, email, password: hashedPassword, isvendor, isProperties, isInquiry, isBlog, isAppicatoin, isJob, type
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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

const loginCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await authModel.findOne({ email });

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
      isvendor,
      isProperties,
      isInquiry,
      isBlog,
      isAppicatoin,
      isJob,
      name, email, type
    } = req.body;

    console.log(id)
    const user = await authModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update permissions
    user.isvendor = isvendor ?? user.isvendor;
    user.isProperties = isProperties ?? user.isProperties;
    user.isInquiry = isInquiry ?? user.isInquiry;
    user.isBlog = isBlog ?? user.isBlog;
    user.isAppicatoin = isAppicatoin ?? user.isAppicatoin;
    user.isJob = isJob ?? user.isJob;
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.type = type ?? user.email;

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



module.exports = {
  registerCtrl,
  loginCtrl,
  getAllUsers,
  editPermissionCtrl,
  deleteAuthCtrl,
  getUserInquiries,
  changeUserTypeCtrl
};
