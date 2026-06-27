const {uploadImageToCloudinary} = require("../config/s3Uploader")
const fs = require('fs');
const createSystemLog = require("../utils/auditLogger");

exports.imageUpload = async(req,res)=>{
    try{
    const {thumbnail} = req.files 
    console.log(thumbnail)

    const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )

      await createSystemLog({
        actorId: req.user?.id || null,
        actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
        entityId: null,
        entityModel: "System",
        action: "CREATE",
        description: `Image uploaded to Cloudinary`,
        newData: {
          image: thumbnailImage.secure_url
        },
        req
      });

      res.status(200).json({
        success:true,
        message:"Image upload successfully",
        thumbnailImage: {
          url: thumbnailImage.secure_url,
          public_id: thumbnailImage.public_id
        }
      })

    }catch(error){
      console.error('Image upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Image upload failed', 
        error: error.message 
      });
    }
}


exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }
    console.log(req.files)
    const files = req.files.thumbnail; // Assumes files are uploaded with the name 'thumbnail'
    const urls = [];

    // Ensure files is an array
    const fileArray = Array.isArray(files) ? files : [files];

    // Upload each file to S3
    for (const file of fileArray) {
      const result = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
      // Extract secure_url and public_id from result
      urls.push({
        url: result.secure_url,
        public_id: result.public_id
      });
      if (fs.existsSync(file.tempFilePath)) {
        fs.unlinkSync(file.tempFilePath); // Delete the temp file
      }
    }

    await createSystemLog({
      actorId: req.user?.id || null,
      actorModel: req.user?.role === "admin" ? "auth" : req.user?.role === "vendor" ? "Vendor" : null,
      entityId: null,
      entityModel: "System",
      action: "CREATE",
      description: `Multiple images uploaded to Cloudinary: ${urls.length} files`,
      newData: {
        images: urls
      },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: urls
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
  }
};