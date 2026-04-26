const bcrypt = require("bcryptjs");
const vendorModel = require("../models/vendorModel");
const jwt = require("jsonwebtoken");

const { uploadImageToCloudinary } = require("../config/s3Uploader");
const { generateOTP, sendSMSOTP, sendWhatsAppOTP, sendWelcomeSMS1, sendWelcomeSMS2, sendWhatsAppWelcome, sendApprovalSMS, sendApprovalWhatsApp } = require("../utils/otpService");

const normalizePhone = (value) => (value || "").toString().trim();
const buildUniquePhones = (...values) => [...new Set(values.map(normalizePhone).filter(Boolean))];
const phoneFieldLabelMap = {
  phone: "Phone",
  whatsappNumber: "WhatsApp",
  alternatePhone: "Alternate phone",
};

const findVendorByAnyNumber = async (numbers, excludeVendorId = null) => {
  const uniqueNumbers = buildUniquePhones(...numbers);
  if (!uniqueNumbers.length) return null;

  const query = {
    $or: [
      { phone: { $in: uniqueNumbers } },
      { whatsappNumber: { $in: uniqueNumbers } },
      { alternatePhone: { $in: uniqueNumbers } },
    ],
  };

  if (excludeVendorId) {
    query._id = { $ne: excludeVendorId };
  }

  return vendorModel.findOne(query).select("_id phone whatsappNumber alternatePhone isPhoneVerified name email");
};

const getConflictingInputFields = (inputNumbers, existingVendor) => {
  if (!existingVendor) return [];
  const existingNumbers = buildUniquePhones(
    existingVendor.phone,
    existingVendor.whatsappNumber,
    existingVendor.alternatePhone
  );

  const conflicts = [];
  if (inputNumbers.phone && existingNumbers.includes(inputNumbers.phone)) conflicts.push("phone");
  if (inputNumbers.whatsappNumber && existingNumbers.includes(inputNumbers.whatsappNumber)) conflicts.push("whatsappNumber");
  if (inputNumbers.alternatePhone && existingNumbers.includes(inputNumbers.alternatePhone)) conflicts.push("alternatePhone");
  return [...new Set(conflicts)];
};

const buildDuplicateNumberMessage = (conflictFields) => {
  if (!conflictFields?.length) {
    return "This number is already registered with another vendor.";
  }
  if (conflictFields.length === 1) {
    return `${phoneFieldLabelMap[conflictFields[0]]} number is already registered with another vendor.`;
  }
  const labels = conflictFields.map((field) => phoneFieldLabelMap[field]);
  return `${labels.join(", ")} numbers are already registered with another vendor.`;
};

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
      name, email, password, phone, company, address, adhar, pan, description, status = "pending",pincode,
      // New fields
      typeOfService, category, subCategory, yearOfEstablishment, serviceLocation,
      alternatePhone, whatsappNumber, businessType, gstNumber, tradeLicense,
      numberOfStaff, referralCode, referralName, workingDays, bankDetail, experience,
      // Price tier fields
      priceTier, selectedPrice
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

    // Check if vendor exists and is phone verified
    console.log('🔍 Looking for existing vendor with:');
    console.log('- Phone:', phone);
    console.log('- WhatsApp:', whatsappNumber);
    
    const inputNumbers = {
      phone: normalizePhone(phone),
      whatsappNumber: normalizePhone(whatsappNumber),
      alternatePhone: normalizePhone(alternatePhone),
    };

    const existingUser = await findVendorByAnyNumber(
      [inputNumbers.phone, inputNumbers.whatsappNumber, inputNumbers.alternatePhone]
    );
    
    console.log('🔍 Existing user found:', !!existingUser);
    if (existingUser) {
      console.log('- User ID:', existingUser._id);
      console.log('- User phone:', existingUser.phone);
      console.log('- User whatsapp:', existingUser.whatsappNumber);
      console.log('- Phone verified:', existingUser.isPhoneVerified);
      console.log('- WhatsApp verified:', existingUser.isWhatsappVerified);
      console.log('- Has name:', !!existingUser.name);
      console.log('- Has email:', !!existingUser.email);
    }
    
    // Only block if vendor is FULLY registered (has name, email, etc.) and verified
    if (existingUser && existingUser.isPhoneVerified && existingUser.name && existingUser.email) {
      const conflictFields = getConflictingInputFields(inputNumbers, existingUser);
      return res.status(400).json({
        success: false,
        message: buildDuplicateNumberMessage(conflictFields),
        errorType: "DUPLICATE_VENDOR_NUMBER",
        duplicateFields: conflictFields,
      });
    }

    // For registration, we need either phone or whatsapp to be verified
    // Check if the numbers being used in registration are verified
    let isVerified = false;
    
    console.log('🔍 Checking verification status:');
    console.log('- Phone from request:', phone);
    console.log('- WhatsApp from request:', whatsappNumber);
    console.log('- WhatsApp is empty/undefined:', !whatsappNumber || whatsappNumber === '');
    
    if (existingUser) {
      console.log('- Existing user found');
      console.log('- Existing user phone:', existingUser.phone);
      console.log('- Existing user whatsapp:', existingUser.whatsappNumber);
      console.log('- Phone verified:', existingUser.isPhoneVerified);
      console.log('- WhatsApp verified:', existingUser.isWhatsappVerified);
      
      // If WhatsApp number is empty, null, undefined, or same as phone - user is not using WhatsApp
      if (!whatsappNumber || whatsappNumber === '' || whatsappNumber === phone) {
        console.log('🔄 User not using WhatsApp, checking phone verification');
        // User is not using WhatsApp, check phone verification
        if (existingUser.phone === phone && existingUser.isPhoneVerified) {
          isVerified = true;
          console.log('✅ Phone number verified for registration:', phone);
        }
      } else {
        console.log('🔄 User using WhatsApp, checking WhatsApp verification');
        // User is using WhatsApp, check WhatsApp verification
        if (existingUser.whatsappNumber === whatsappNumber && existingUser.isWhatsappVerified) {
          isVerified = true;
          console.log('✅ WhatsApp number verified for registration:', whatsappNumber);
        }
      }
      
      // Additional fallback: if phone matches and is verified, allow registration regardless
      if (!isVerified && existingUser.phone === phone && existingUser.isPhoneVerified) {
        isVerified = true;
        console.log('✅ Phone verification fallback successful:', phone);
      }
    } else {
      console.log('❌ No existing user found with provided numbers');
    }
    
    if (!isVerified) {
      console.log('❌ Verification failed for registration:');
      console.log('- Phone:', phone);
      console.log('- WhatsApp Number:', whatsappNumber);
      console.log('- Existing User Phone:', existingUser?.phone);
      console.log('- Existing User WhatsApp:', existingUser?.whatsappNumber);
      console.log('- Phone Verified:', existingUser?.isPhoneVerified);
      console.log('- WhatsApp Verified:', existingUser?.isWhatsappVerified);
      
      return res.status(400).json({
        success: false,
        message: "Phone number not verified. Please verify your phone number with OTP first.",
        requiresOTP: true
      });
    }
    
    console.log('✅ Verification successful, proceeding with registration');

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
                
                // Add small delay to avoid overwhelming S3
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
    let paymentMethodValue = req.body.paymentMethod || "bank";
    let upiIdValue = req.body.upiId || "";
    
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
    
    // Handle bank details if sent as flattened fields (only if payment method is bank)
    if (paymentMethodValue === "bank" && (req.body['bankDetail[accountNumber]'] || req.body['bankDetail[IFSC]'] || 
        req.body['bankDetail[accountHolderName]'] || req.body['bankDetail[branch]'])) {
      processedBankDetail = {
        accountNumber: sanitizeValue(req.body['bankDetail[accountNumber]']) || '',
        IFSC: sanitizeValue(req.body['bankDetail[IFSC]']) || '',
        accountHolderName: sanitizeValue(req.body['bankDetail[accountHolderName]']) || '',
        branch: sanitizeValue(req.body['bankDetail[branch]']) || '',
      };
    } else if (paymentMethodValue === "upi") {
      // Clear bank details if UPI is selected
      processedBankDetail = {
        accountNumber: '',
        IFSC: '',
        accountHolderName: '',
        branch: '',
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
      pincode: sanitizeValue(pincode),
      // Price tier information
      selectedPriceTier: sanitizeValue(priceTier) || "basic",
      selectedPrice: selectedPrice ? parseInt(sanitizeValue(selectedPrice)) : 0,
    };

    const user = await vendorModel.findByIdAndUpdate(
      existingUser._id,
      {
        ...sanitizedData,
        password: hashedPassword,
        numberOfStaff: processedNumberOfStaff,
        paymentMethod: paymentMethodValue,
        bankDetail: processedBankDetail, 
        upiId: paymentMethodValue === "upi" ? sanitizeValue(upiIdValue) : "",
        experience: processedExperience,
        // File uploads
        ...fileUpdates
      },
      { new: true }
    );

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

    // Don't send welcome messages on registration anymore
    // Welcome messages will be sent when vendor purchases their first category

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

    const loginNumber = normalizePhone(phone);
    const user = await vendorModel.findOne({
      $or: [
        { phone: loginNumber },
        { whatsappNumber: loginNumber },
        { alternatePhone: loginNumber },
      ],
    });

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

    // Get the vendor before updating to check previous status
    const existingVendor = await vendorModel.findById(id);
    if (!existingVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const updatedVendor = await vendorModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    // Send approval messages if status changed to "approved"
    if (status === "approved" && existingVendor.status !== "approved") {
      console.log('🎉 Vendor approved! Sending approval messages...');
      
      try {
        // Always send SMS approval message
        if (updatedVendor.phone) {
          const smsResult = await sendApprovalSMS(updatedVendor.phone, updatedVendor.name, updatedVendor._id);
          if (smsResult.success) {
            console.log('✅ Approval SMS sent successfully');
          } else {
            console.error('❌ Approval SMS failed:', smsResult.message);
          }
        }
        
        // Send WhatsApp approval message if vendor has WhatsApp verified
        if (updatedVendor.whatsappNumber && updatedVendor.isWhatsappVerified) {
          console.log('📱 Sending WhatsApp approval message...');
          const whatsappResult = await sendApprovalWhatsApp(updatedVendor.whatsappNumber, updatedVendor.name, updatedVendor._id);
          if (whatsappResult.success) {
            console.log('✅ WhatsApp approval message sent successfully');
          } else {
            console.error('❌ WhatsApp approval message failed:', whatsappResult.message);
          }
        }
        
      } catch (approvalError) {
        console.error('❌ Error sending approval messages:', approvalError);
        // Don't fail the status update if approval messages fail
      }
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

    // Sanitize function to handle objects and arrays
    const sanitizeValue = (value, fieldName) => {
      if (value === null || value === undefined) return value;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        console.log(`⚠️ Object detected for field ${fieldName}:`, value);
        // For category field, extract _id
        if (fieldName === 'category' && value._id) {
          return value._id;
        }
        // For other objects, convert to string or return null
        return null;
      }
      
      if (Array.isArray(value)) {
        console.log(`⚠️ Array detected for field ${fieldName}, taking first value:`, value);
        return value[0];
      }
      
      if (typeof value === 'string' && value === "[object Object]") {
        console.log(`⚠️ Stringified object detected for field ${fieldName}`);
        return null;
      }
      
      return value;
    };

    // Sanitize all updateData fields
    Object.keys(updateData).forEach(key => {
      const originalValue = updateData[key];
      const sanitizedValue = sanitizeValue(originalValue, key);
      
      if (sanitizedValue !== originalValue) {
        console.log(`🔧 Sanitized ${key}:`, { original: originalValue, sanitized: sanitizedValue });
        if (sanitizedValue === null) {
          delete updateData[key];
        } else {
          updateData[key] = sanitizedValue;
        }
      }
    });

    // Always set updateProfileRequest to "requested" (pending admin approval)
    updateData.updateProfileRequest = "requested";

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
    const paymentMethod = updateData.paymentMethod || "bank";
    
    if (paymentMethod === "bank" && (updateData['bankDetail[accountNumber]'] || updateData['bankDetail[IFSC]'] ||
        updateData['bankDetail[accountHolderName]'] || updateData['bankDetail[branch]'])) {
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
      
      // Clear UPI if bank is selected
      updateData.upiId = "";
    } else if (paymentMethod === "upi") {
      // Clear bank details if UPI is selected
      updateData.bankDetail = {
        accountNumber: '',
        IFSC: '',
        accountHolderName: '',
        branch: '',
      };
      // UPI ID is already in updateData
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

    // Handle category field properly - extract ObjectId from object or use categoryId
    if (updateData.category) {
      if (typeof updateData.category === 'object') {
        // If category is an object, extract the _id
        updateData.category = updateData.category._id || updateData.category.id;
        console.log("✅ Extracted category ID from object:", updateData.category);
      } else if (updateData.category === "[object Object]") {
        // If it's stringified object, use categoryId instead
        if (updateData.categoryId) {
          updateData.category = updateData.categoryId;
          console.log("✅ Using categoryId instead of invalid category object:", updateData.category);
        } else {
          console.log("⚠️ Removing invalid category field");
          delete updateData.category;
        }
      }
      
      // Validate ObjectId format
      if (updateData.category && typeof updateData.category === 'string') {
        const ObjectId = require('mongoose').Types.ObjectId;
        if (!ObjectId.isValid(updateData.category)) {
          console.log("⚠️ Invalid ObjectId format for category:", updateData.category);
          delete updateData.category;
        }
      }
      
      // Remove categoryId as it's not needed in the model
      delete updateData.categoryId;
    } else if (updateData.categoryId) {
      // If only categoryId is provided, use it as category
      const ObjectId = require('mongoose').Types.ObjectId;
      if (ObjectId.isValid(updateData.categoryId)) {
        updateData.category = updateData.categoryId;
        delete updateData.categoryId;
        console.log("✅ Using categoryId as category:", updateData.category);
      } else {
        console.log("⚠️ Invalid categoryId format:", updateData.categoryId);
        delete updateData.categoryId;
      }
    }

    // Duplicate number validation for profile updates
    const currentVendor = await vendorModel.findById(id).select("phone whatsappNumber alternatePhone");
    if (!currentVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const nextNumbers = {
      phone: updateData.phone !== undefined ? normalizePhone(updateData.phone) : normalizePhone(currentVendor.phone),
      whatsappNumber:
        updateData.whatsappNumber !== undefined
          ? normalizePhone(updateData.whatsappNumber)
          : normalizePhone(currentVendor.whatsappNumber),
      alternatePhone:
        updateData.alternatePhone !== undefined
          ? normalizePhone(updateData.alternatePhone)
          : normalizePhone(currentVendor.alternatePhone),
    };

    const conflictingVendor = await findVendorByAnyNumber(
      [nextNumbers.phone, nextNumbers.whatsappNumber, nextNumbers.alternatePhone],
      id
    );

    if (conflictingVendor) {
      const conflictFields = getConflictingInputFields(nextNumbers, conflictingVendor);
      return res.status(400).json({
        success: false,
        message: buildDuplicateNumberMessage(conflictFields),
        errorType: "DUPLICATE_VENDOR_NUMBER",
        duplicateFields: conflictFields,
      });
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
        await Promise.all(uploadPromises);
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

// Send OTP for vendor registration
const sendVendorOTP = async (req, res) => {
  try {
    const { phone, whatsappNumber, preferredMethod, forceResend } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    // For WhatsApp method, we'll verify the WhatsApp number
    // For SMS method, we'll verify the phone number
    const numberToVerify = preferredMethod === 'whatsapp' && whatsappNumber ? whatsappNumber : phone;

    // Check if phone number is already registered in vendor collection ONLY
    const existingVendor = await vendorModel.findOne({ 
      $or: [
        { phone: numberToVerify },
        { whatsappNumber: numberToVerify }
      ]
    });
    
    // Block if vendor is fully registered (has name and is verified)
    if (existingVendor && existingVendor.isPhoneVerified && existingVendor.name && !forceResend) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already registered as a vendor. Please use a different number or login."
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let otpResult;
    let targetNumber = numberToVerify;

    // Send OTP based on preferred method
    if (preferredMethod === 'whatsapp' && whatsappNumber) {
      console.log('🔄 Attempting WhatsApp OTP to:', whatsappNumber);
      otpResult = await sendWhatsAppOTP(
        whatsappNumber, 
        otp, 
        existingVendor?._id, 
        null, 
        existingVendor?.name
      );
    } else {
      console.log('🔄 Attempting SMS OTP to:', phone);
      otpResult = await sendSMSOTP(
        phone, 
        otp, 
        existingVendor?._id, 
        null, 
        existingVendor?.name
      );
      targetNumber = phone;
    }

    if (!otpResult.success) {
      return res.status(500).json({
        success: false,
        message: otpResult.message,
        error: otpResult.error
      });
    }

    // Determine the actual method used and message
    let actualMethod = preferredMethod;
    let responseMessage = otpResult.message;
    
    if (otpResult.method === 'sms_fallback') {
      actualMethod = 'sms_fallback';
      responseMessage = `OTP sent via SMS to your WhatsApp number (${targetNumber}) - WhatsApp temporarily unavailable`;
    }

    // Store or update OTP in database using the number being verified
    if (existingVendor) {
      existingVendor.otp = otp;
      existingVendor.otpExpiry = otpExpiry;
      existingVendor.preferredOtpMethod = preferredMethod;
      
      // Reset verification status for re-verification
      if (forceResend) {
        existingVendor.isPhoneVerified = false;
        existingVendor.isWhatsappVerified = false;
      }
      
      // Update the correct number field
      if (preferredMethod === 'whatsapp' && whatsappNumber) {
        existingVendor.whatsappNumber = whatsappNumber;
      } else {
        existingVendor.phone = phone;
      }
      
      await existingVendor.save();
    } else {
      const vendorData = {
        otp,
        otpExpiry,
        preferredOtpMethod: preferredMethod,
        status: 'pending',
        isPhoneVerified: false,
        isWhatsappVerified: false
      };
      
      // Set the correct number field
      if (preferredMethod === 'whatsapp' && whatsappNumber) {
        vendorData.whatsappNumber = whatsappNumber;
        vendorData.phone = phone; // Also store phone as backup
      } else {
        vendorData.phone = phone;
      }
      
      await vendorModel.create(vendorData);
    }

    return res.status(200).json({
      success: true,
      message: responseMessage,
      method: actualMethod,
      targetNumber: targetNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3'), // Mask middle digits
      originalMethod: preferredMethod // Show what user originally requested
    });

  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message
    });
  }
};

// Verify OTP for vendor registration
const verifyVendorOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required"
      });
    }

    // Find vendor with the phone number (could be in phone or whatsappNumber field)
    const vendor = await vendorModel.findOne({
      $or: [
        { phone: phone },
        { whatsappNumber: phone }
      ]
    });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "No registration found with this number"
      });
    }

    // Check if OTP is valid and not expired
    if (vendor.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (new Date() > vendor.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Mark as verified based on which method was used
    vendor.isPhoneVerified = true;
    if (vendor.preferredOtpMethod === 'whatsapp') {
      vendor.isWhatsappVerified = true;
    }
    
    // Clear OTP data
    vendor.otp = undefined;
    vendor.otpExpiry = undefined;
    
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now complete your registration.",
      isVerified: true,
      method: vendor.preferredOtpMethod
    });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message
    });
  }
};


// Vendor Forgot Password - Send OTP
const vendorForgotPasswordCtrl = async (req, res) => {
  try {
    const { phone, otpMethod = 'sms' } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if vendor exists
    const vendor = await vendorModel.findOne({ phone });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found with this phone number",
      });
    }

    // Generate OTP
    const { generateOTP, sendSMSOTP, sendWhatsAppOTP } = require('../utils/otpService');
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to vendor
    vendor.resetPasswordOTP = otp;
    vendor.resetPasswordOTPExpiry = otpExpiry;
    await vendor.save();

    // Send OTP based on method
    let otpResult;
    if (otpMethod === 'whatsapp') {
      // Use whatsapp number if available, otherwise use phone
      const whatsappNumber = vendor.whatsappNumber || phone;
      otpResult = await sendWhatsAppOTP(whatsappNumber, otp, vendor._id, null, vendor.name);
    } else {
      otpResult = await sendSMSOTP(phone, otp, vendor._id, null, vendor.name);
    }

    if (otpResult.success) {
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
    console.error("Vendor forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Vendor Verify OTP for Password Reset
const vendorVerifyResetOTPCtrl = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const vendor = await vendorModel.findOne({ phone });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Check if OTP exists and is not expired
    if (!vendor.resetPasswordOTP || !vendor.resetPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    if (new Date() > vendor.resetPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (vendor.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid - generate a temporary token for password reset
    const resetToken = jwt.sign(
      { vendorId: vendor._id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Clear OTP fields
    vendor.resetPasswordOTP = undefined;
    vendor.resetPasswordOTPExpiry = undefined;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Vendor verify reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Vendor Reset Password
const vendorResetPasswordCtrl = async (req, res) => {
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

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const vendor = await vendorModel.findById(decoded.vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    vendor.password = hashedPassword;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Vendor reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Admin Reset Vendor Password (No OTP Required)
const adminResetVendorPasswordCtrl = async (req, res) => {
  try {
    console.log("📝 Admin reset password request received");
    console.log("Request body:", req.body);
    
    const { vendorId, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!vendorId || !newPassword || !confirmPassword) {
      console.log("❌ Validation failed: Missing fields");
      return res.status(400).json({
        success: false,
        message: "Vendor ID, new password, and confirm password are required",
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      console.log("❌ Validation failed: Passwords don't match");
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find vendor
    console.log("🔍 Looking for vendor:", vendorId);
    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) {
      console.log("❌ Vendor not found");
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    console.log("✅ Vendor found:", vendor.name, vendor.phone);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    vendor.password = hashedPassword;
    await vendor.save();

    console.log(`✅ Admin reset password for vendor: ${vendor.phone}`);

    return res.status(200).json({
      success: true,
      message: "Vendor password reset successfully by admin",
    });
  } catch (error) {
    console.error("❌ Admin reset vendor password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

// Update vendor profile image only
const updateVendorProfileImageCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    console.log("📸 Profile image update request for vendor:", id);
    console.log("📄 Files received:", files ? Object.keys(files) : "No files");

    if (!files?.profilePhoto) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    // Upload profile photo to S3
    try {
      console.log("📸 Uploading profile photo...");
      const uploadResult = await uploadImageToCloudinary(files.profilePhoto, "profilePhoto");
      
      // Update vendor with new profile photo URL
      const updatedVendor = await vendorModel.findByIdAndUpdate(
        id,
        { $set: { profilePhoto: uploadResult.secure_url } },
        { new: true, runValidators: true }
      ).populate('category', 'name');

      if (!updatedVendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      console.log("✅ Profile photo updated successfully:", uploadResult.secure_url);

      // Transform vendor data for display
      const vendorObj = updatedVendor.toObject();
      const transformedVendor = transformVendorForDisplay(vendorObj);

      return res.status(200).json({
        success: true,
        message: "Profile photo updated successfully",
        vendor: transformedVendor,
        profilePhoto: uploadResult.secure_url,
      });
    } catch (uploadError) {
      console.error("❌ Profile photo upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading profile photo. Please try again.",
        error: uploadError.message,
      });
    }
  } catch (error) {
    console.error("❌ Update profile image error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile photo",
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
  deleteVendorCtrl,
  sendVendorOTP,
  verifyVendorOTP,
  vendorForgotPasswordCtrl,
  vendorVerifyResetOTPCtrl,
  vendorResetPasswordCtrl,
  adminResetVendorPasswordCtrl,
  updateVendorProfileImageCtrl
};
