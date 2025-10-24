const bcrypt = require("bcryptjs");
const vendorModel = require("../models/vendorModel");
const jwt = require("jsonwebtoken");




const vendorRegisterCtrl = async (req, res) => {
  try {
    const {
      name, email, password, phone, company, address, adhar, pan, description, status = "pending"
    } = req.body;

    if (!name || !email || !password) {
      return res.status(403).send({
        success: false,
        message: "All required fields must be filled",
      });
    }


    const existingUser = await vendorModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Vendor already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await vendorModel.create({
      name, email, password: hashedPassword, phone, company, address, adhar, pan, description, status
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
      message: "Vendor registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Vendor cannot be registered. Please try again.",
    });
  }
};

const vendorLoginCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await vendorModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Vendor is not Registered with Us Please SignUp to Continue`,
      });
    }
    if (user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: `Your account is not active till now`,
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
        message: `Vendor Login Success`,
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



const getAllVendorCtrl = async (req, res) => {
  try {
    const vendors = await vendorModel.find();
    return res.status(200).json({
      success: true,
      vendors
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in getting all vendor api"
    })
  }
}

const updateVendorStatusCtrl = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }



    const updatedVendor = await vendorModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor status updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateVendorPercentageCtrl = async (req, res) => {
  try {
    const { percentage } = req.body;
    const { id } = req.params;
    if (!percentage) {
      return res.status(400).json({
        success: false,
        message: "percentage is required",
      });
    }



    const updatedVendor = await vendorModel.findByIdAndUpdate(
      id,
      { percentage },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor percentage updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getVendorByIDCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await vendorModel.findById(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      vendor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in getting vendor by ID",
    });
  }
};


const updateVendorProfileCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedVendor = await vendorModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating vendor profile",
    });
  }
};





module.exports = {
  vendorRegisterCtrl,
  vendorLoginCtrl,
  getAllVendorCtrl,
  updateVendorStatusCtrl,
  getVendorByIDCtrl,
  updateVendorProfileCtrl,
  updateVendorPercentageCtrl
};
