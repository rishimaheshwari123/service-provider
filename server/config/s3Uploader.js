const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getS3Client } = require("./s3Config");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

/**
 * Upload file to AWS S3
 * @param {Object} file - File object from express-fileupload
 * @param {String} folder - Folder name in S3 bucket
 * @param {Number} height - Optional height for image resizing
 * @param {Number} quality - Optional quality for image compression (1-100)
 * @returns {Object} - Returns object with secure_url and public_id (S3 key)
 */
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
    const s3Client = getS3Client();
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error("AWS_S3_BUCKET_NAME not configured in environment variables");
    }

    let fileBuffer = fs.readFileSync(file.tempFilePath);
    let contentType = file.mimetype;
    const fileExtension = path.extname(file.name);
    
    // Process image if height or quality is specified
    if ((height || quality) && file.mimetype.startsWith('image/')) {
      const sharpInstance = sharp(fileBuffer);
      
      if (height) {
        sharpInstance.resize({ height: parseInt(height), withoutEnlargement: true });
      }
      
      if (quality) {
        const qualityValue = parseInt(quality);
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
          sharpInstance.jpeg({ quality: qualityValue });
        } else if (file.mimetype === 'image/png') {
          sharpInstance.png({ quality: qualityValue });
        } else if (file.mimetype === 'image/webp') {
          sharpInstance.webp({ quality: qualityValue });
        }
      }
      
      fileBuffer = await sharpInstance.toBuffer();
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}${fileExtension}`;
    
    // Upload directly to bucket root (no folder)
    const s3Key = fileName;

    // Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate public URL
    const region = process.env.AWS_REGION;
    const secure_url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    // Clean up temp file
    if (fs.existsSync(file.tempFilePath)) {
      fs.unlinkSync(file.tempFilePath);
    }

    // Return in Cloudinary-compatible format
    return {
      secure_url: secure_url,
      public_id: s3Key,
      resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
      format: fileExtension.replace('.', ''),
      original_filename: file.name,
    };
  } catch (error) {
    console.error("❌ S3 Upload Error:", error);
    throw error;
  }
};
