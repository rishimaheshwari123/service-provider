const bcrypt = require("bcryptjs");
const vendorModel = require("../models/vendorModel");
const jwt = require("jsonwebtoken");

const { uploadImageToCloudinary } = require("../config/imageUploader")

// Helper function to convert text to PascalCase
const toPascalCase = (text) => {
  if (!text) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to transform vendor data for display
const transformVendorForDisplay = (vendorObj) => {
  return {
    ...vendorObj,
    name: toPascalCase(vendorObj.name),
    company: toPascalCase(vendorObj.company),
    // Keep both category formats for compatibility
    category: vendorObj.category ? {
      _id: vendorObj.category._id,
      name: toPascalCase(vendorObj.category.name)
    } : vendorObj.category,
    // Also provide categoryId for form compatibility
    categoryId: vendorObj.category?._id || vendorObj.category
  };
};



const vendorRegisterCtrl = async (req, res) => {
  try {
    const {
      name, email, password, phone, company, address, adhar, pan, description, status = "pending",
      // New fields
      typeOfService, category, subCategory, yearOfEstablishment, serviceLocation,
      alternatePhone, whatsappNumber, businessType, gstNumber, tradeLicense,
      numberOfStaff, referralCode, referralName, workingDays, bankDetail, experience
    } = req.body;
    
    const files = req.files;
    
    // Debug: Log received files with more details
    console.log("📁 Files received:", files ? Object.keys(files) : "No files");
    if (files) {
      Object.keys(files).forEach(key => {
        const file = files[key];
        console.log(`📄 ${key}:`, {
          name: file.name,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }
    
    // Debug: Log all form data
    console.log("📋 Form data received:");
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      if (Array.isArray(value)) {
        console.log(`${key}: [Array with ${value.length} items] ${JSON.stringify(value)}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });

    if (!name  || !password || !phone) {
      return res.status(403).send({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const existingUser = await vendorModel.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Vendor already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Handle file uploads with better error handling
    const fileUpdates = {};
    const uploadPromises = [];
    
    try {
      if (files?.profilePhoto) {
        console.log("📸 Uploading profile photo...");
        uploadPromises.push(
          uploadImageToCloudinary(files.profilePhoto, "profilePhoto")
            .then(result => {
              fileUpdates.profilePhoto = result.secure_url;
              console.log("✅ Profile photo uploaded:", result.secure_url);
            })
            .catch(error => {
              console.error("❌ Profile photo upload failed:", error);
              throw new Error(`Profile photo upload failed: ${error.message}`);
            })
        );
      }
      
      // Upload documents with individual error handling and retry logic
      for (let i = 1; i <= 5; i++) {
        const docKey = `document${i}`;
        if (files?.[docKey]) {
          console.log(`📄 Preparing to upload ${docKey}...`);
          
          // Add retry logic for document uploads
          const uploadWithRetry = async (file, folder, retries = 2) => {
            for (let attempt = 1; attempt <= retries + 1; attempt++) {
              try {
                console.log(`📤 ${docKey} upload attempt ${attempt}/${retries + 1}`);
                
                // Add small delay to avoid overwhelming Cloudinary
                if (attempt > 1) {
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                const result = await uploadImageToCloudinary(file, folder);
                return result;
              } catch (error) {
                console.error(`❌ ${docKey} upload attempt ${attempt} failed:`, error.message);
                if (attempt === retries + 1) {
                  throw error; // Final attempt failed
                }
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            }
          };
          
          uploadPromises.push(
            uploadWithRetry(files[docKey], "vendorDocuments")
              .then(result => {
                fileUpdates[docKey] = result.secure_url;
                console.log(`✅ ${docKey} uploaded:`, result.secure_url);
              })
              .catch(error => {
                console.error(`❌ ${docKey} upload failed after retries:`, error);
                throw new Error(`${docKey} upload failed: ${error.message}`);
              })
          );
        }
      }
      
      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        console.log(`📤 Starting ${uploadPromises.length} file uploads...`);
        await Promise.all(uploadPromises);
        console.log("📁 All file uploads completed:", Object.keys(fileUpdates));
      } else {
        console.log("📁 No files to upload");
      }
      
    } catch (uploadError) {
      console.error("❌ File upload error:", uploadError);
      
      // Provide detailed error information
      const errorDetails = {
        message: uploadError.message,
        uploadedFiles: Object.keys(fileUpdates),
        totalFilesAttempted: uploadPromises.length,
        failedAt: uploadError.message.includes('document') ? uploadError.message.split(' ')[0] : 'unknown'
      };
      
      return res.status(500).json({
        success: false,
        message: `Error uploading files: ${uploadError.message}`,
        error: errorDetails,
        uploadedFiles: Object.keys(fileUpdates), // Show which files were uploaded successfully
      });
    }

    // Sanitize and process data to handle FormData duplicates
    const sanitizeValue = (value) => {
      if (Array.isArray(value)) {
        console.log(`⚠️ Array detected for field, taking first value:`, value);
        return value[0]; // Take first value if array
      }
      return value;
    };

    // Transform nested objects similar to updateVendorProfileCtrl
    let processedBankDetail = bankDetail;
    let processedExperience = experience;
    let processedNumberOfStaff = 0;
    
    // Handle numberOfStaff properly - ensure it's always a single number
    if (numberOfStaff !== undefined && numberOfStaff !== null && numberOfStaff !== '') {
      const staffValue = sanitizeValue(numberOfStaff);
      processedNumberOfStaff = parseInt(staffValue) || 0;
      console.log("👥 numberOfStaff processed:", { original: numberOfStaff, sanitized: staffValue, final: processedNumberOfStaff });
    }
    
    // Additional check to prevent array values from reaching the model
    if (Array.isArray(processedNumberOfStaff)) {
      console.log("⚠️ numberOfStaff is still an array, converting:", processedNumberOfStaff);
      processedNumberOfStaff = parseInt(processedNumberOfStaff[0]) || 0;
    }
    
    // Handle bank details if sent as flattened fields
    if (req.body['bankDetail[accountNumber]'] || req.body['bankDetail[IFSC]'] || 
        req.body['bankDetail[accountHolderName]'] || req.body['bankDetail[branch]']) {
      processedBankDetail = {
        accountNumber: sanitizeValue(req.body['bankDetail[accountNumber]']) || '',
        IFSC: sanitizeValue(req.body['bankDetail[IFSC]']) || '',
        accountHolderName: sanitizeValue(req.body['bankDetail[accountHolderName]']) || '',
        branch: sanitizeValue(req.body['bankDetail[branch]']) || '',
      };
    }
    
    // Handle experience if sent as flattened fields
    if (req.body['experience[fields]'] || req.body['experience[totalYears]']) {
      const experienceFields = req.body['experience[fields]'];
      const totalYears = req.body['experience[totalYears]'];
      
      processedExperience = {
        fields: experienceFields
          ? Array.isArray(experienceFields)
            ? experienceFields
            : [experienceFields]
          : [],
        totalYears: totalYears
          ? parseInt(sanitizeValue(totalYears)) || 0
          : 0,
      };
    }

    // Sanitize all other fields
    const sanitizedData = {
      name: sanitizeValue(name),
      email: sanitizeValue(email),
      phone: sanitizeValue(phone),
      company: sanitizeValue(company),
      address: sanitizeValue(address),
      adhar: sanitizeValue(adhar),
      pan: sanitizeValue(pan),
      description: sanitizeValue(description),
      status: sanitizeValue(status),
      typeOfService: sanitizeValue(typeOfService),
      category: sanitizeValue(category),
      subCategory: sanitizeValue(subCategory),
      yearOfEstablishment: sanitizeValue(yearOfEstablishment),
      serviceLocation: sanitizeValue(serviceLocation),
      alternatePhone: sanitizeValue(alternatePhone),
      whatsappNumber: sanitizeValue(whatsappNumber),
      businessType: sanitizeValue(businessType),
      gstNumber: sanitizeValue(gstNumber),
      tradeLicense: sanitizeValue(tradeLicense),
      referralCode: sanitizeValue(referralCode),
      referralName: sanitizeValue(referralName),
      workingDaysTimings: sanitizeValue(workingDays), // Fix: map workingDays to workingDaysTimings
    };

    const user = await vendorModel.create({
      ...sanitizedData,
      password: hashedPassword,
      numberOfStaff: processedNumberOfStaff,
      bankDetail: processedBankDetail, 
      experience: processedExperience,
      // File uploads
      ...fileUpdates
    });

    // Populate category for transformation
    const populatedUser = await vendorModel.findById(user._id).populate('category', 'name');
    
    // Transform vendor data to PascalCase for display
    const userObj = populatedUser.toObject();
    const transformedUser = transformVendorForDisplay(userObj);

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
      user: transformedUser,
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
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await vendorModel.findOne({ phone });

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
    const vendors = await vendorModel.find().populate('category', 'name').sort({ name: 1 }); // Sort alphabetically by name (A-Z) and populate category
    
    // Transform vendor data to PascalCase for display
    const transformedVendors = vendors.map(vendor => {
      const vendorObj = vendor.toObject();
      return transformVendorForDisplay(vendorObj);
    });
    
    return res.status(200).json({
      success: true,
      vendors: transformedVendors
    })
  } catch (error) {
    console.error("Error in getAllVendorCtrl:", error);
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
    const vendor = await vendorModel.findById(id).populate('category', 'name');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Transform vendor data to PascalCase for display
    const vendorObj = vendor.toObject();
    const transformedVendor = transformVendorForDisplay(vendorObj);

    return res.status(200).json({
      success: true,
      vendor: transformedVendor,
    });
  } catch (error) {
    console.error("Error in getVendorByIDCtrl:", error);
    return res.status(500).json({
      success: false,
      message: "Error in getting vendor by ID",
    });
  }
};


updateVendorProfileCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const files = req.files;
    const fileUpdates = {};

    console.log("📋 Update request received for vendor:", id);
    console.log("📄 Files received:", files ? Object.keys(files) : "No files");
    console.log("📝 Form data keys:", Object.keys(updateData));

    // Always set updateProfileRequest to "pending"
    updateData.updateProfileRequest = "pending";

    // Transform experience fields from request body
    if (updateData['experience[fields]'] || updateData['experience[totalYears]']) {
      updateData.experience = {
        fields: updateData['experience[fields]']
          ? Array.isArray(updateData['experience[fields]'])
            ? updateData['experience[fields]']
            : [updateData['experience[fields]']]
          : [],
        totalYears: updateData['experience[totalYears]']
          ? Number(updateData['experience[totalYears]'])
          : 0,
      };

      delete updateData['experience[fields]'];
      delete updateData['experience[totalYears]'];
    }

    // Transform bank detail fields from request body
    if (updateData['bankDetail[accountNumber]'] || updateData['bankDetail[IFSC]'] ||
        updateData['bankDetail[accountHolderName]'] || updateData['bankDetail[branch]']) {
      updateData.bankDetail = {
        accountNumber: updateData['bankDetail[accountNumber]'] || '',
        IFSC: updateData['bankDetail[IFSC]'] || '',
        accountHolderName: updateData['bankDetail[accountHolderName]'] || '',
        branch: updateData['bankDetail[branch]'] || '',
      };

      delete updateData['bankDetail[accountNumber]'];
      delete updateData['bankDetail[IFSC]'];
      delete updateData['bankDetail[accountHolderName]'];
      delete updateData['bankDetail[branch]'];
    }

    // Transform working days to workingDaysTimings field
    if (updateData.workingDays) {
      updateData.workingDaysTimings = updateData.workingDays;
      delete updateData.workingDays;
    }

    // Handle workingHours field - completely exclude it from general profile updates
    // workingHours should only be updated via the dedicated updateWorkingHours endpoint
    if (updateData.workingHours) {
      console.log("⚠️ Removing workingHours from general profile update - use dedicated endpoint");
      delete updateData.workingHours;
    }

    // Upload files if provided - handle all 5 documents plus profile photo
    const uploadPromises = [];

    try {
      if (files?.profilePhoto) {
        console.log("📸 Uploading profile photo...");
        uploadPromises.push(
          uploadImageToCloudinary(files.profilePhoto, "profilePhoto")
            .then(result => {
              fileUpdates.profilePhoto = result.secure_url;
              console.log("✅ Profile photo uploaded:", result.secure_url);
            })
        );
      }

      // Handle all 5 documents
      for (let i = 1; i <= 5; i++) {
        const docKey = `document${i}`;
        if (files?.[docKey]) {
          console.log(`📄 Uploading ${docKey}...`);
          uploadPromises.push(
            uploadImageToCloudinary(files[docKey], "vendorDocuments")
              .then(result => {
                fileUpdates[docKey] = result.secure_url;
                console.log(`✅ ${docKey} uploaded:`, result.secure_url);
              })
              .catch(error => {
                console.error(`❌ ${docKey} upload failed:`, error);
                throw new Error(`${docKey} upload failed: ${error.message}`);
              })
          );
        }
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        console.log(`📤 Starting ${uploadPromises.length} file uploads...`);
        await Promise.all(uploadPromises);
        console.log("📁 All file uploads completed:", Object.keys(fileUpdates));
      }

    } catch (uploadError) {
      console.error("❌ File upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading files. Please try again.",
        error: uploadError.message,
        uploadedFiles: Object.keys(fileUpdates),
      });
    }

    // Update vendor
    const updatedVendor = await vendorModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, ...fileUpdates } },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    console.log("✅ Vendor updated successfully:", updatedVendor._id);
    console.log("📁 Files updated:", Object.keys(fileUpdates));

    // Transform vendor data to PascalCase for display
    const vendorObj = updatedVendor.toObject();
    const transformedVendor = transformVendorForDisplay(vendorObj);

    return res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      vendor: transformedVendor,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating vendor profile",
      error: error.message,
    });
  }
}









const updateWorkingHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { workingHours } = req.body;
    // workingHours = {
    //   monday: { start: "09:00", end: "18:00", available: true },
    //   tuesday: { start: "09:00", end: "18:00", available: true },
    //   ...
    // }

    // Find vendor by ID
    const vendor = await vendorModel.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    // Update only provided days
    for (let day in workingHours) {
      if (vendor.workingHours[day]) {
        vendor.workingHours[day].start = workingHours[day].start ?? vendor.workingHours[day].start;
        vendor.workingHours[day].end = workingHours[day].end ?? vendor.workingHours[day].end;
        vendor.workingHours[day].available = workingHours[day].available ?? vendor.workingHours[day].available;
      }
    }

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Working hours updated successfully",
      workingHours: vendor.workingHours,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const requestProfileUpdateCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateProfileRequest } = req.body; // get value from body

    if (!updateProfileRequest) {
      return res.status(400).json({
        success: false,
        message: "updateProfileRequest is required",
      });
    }

    // Update the vendor's updateProfileRequest field
    const updatedVendor = await vendorModel.findByIdAndUpdate(
      id,
      { updateProfileRequest },
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
      message: "Profile update request updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("❌ Request update error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile request",
      error: error.message,
    });
  }
};

const deleteVendorCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if vendor exists
    const vendor = await vendorModel.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Delete all properties/services associated with this vendor
    const propertyModel = require("../models/propertyModel");
    await propertyModel.deleteMany({ vendorId: id });

    // Delete the vendor
    await vendorModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Vendor and all associated services deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting vendor",
      error: error.message,
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
  updateVendorPercentageCtrl,
  updateWorkingHours,
  requestProfileUpdateCtrl,
  deleteVendorCtrl
};
