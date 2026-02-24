const cloudinary = require("cloudinary").v2

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  const options = { 
    folder,
    secure: true // Force HTTPS URLs
  }
  if (height) {
    options.height = height
  }
  if (quality) {
    options.quality = quality
  }
  options.resource_type = "auto"
  // console.log("OPTIONS", options)
  return await cloudinary.uploader.upload(file.tempFilePath, options)
}
