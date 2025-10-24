const { uploadImageToCloudinary } = require("../config/imageUploader");
const blogModel = require("../models/blogModel")

const createBlogsCtrl = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const image = req.files.image;

    if (!title || !desc || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields"
      })
    }
    const thumnailImage = await uploadImageToCloudinary(image, process.env.FOLDER_NAME)

    const blog = await blogModel.create({
      title,
      desc,
      image: thumnailImage.secure_url
    })

    return res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      blog
    })

  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success: false,
      message: "Error in create blog api!"
    })
  }
}

const updateBlogCtrl = async (req, res) => {
  try {
    console.log(req.params)
    const { blogId } = req.params; // Get the blogId from the URL params
    const { title, desc, type } = req.body;
    let image = req.files?.image;

    // Validate if required fields are present
    if (!title || !desc || !type) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Find the blog by its ID
    const blog = await blogModel.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // If there's a new image, upload it to Cloudinary, otherwise use the current image URL
    if (image) {
      const thumnailImage = await uploadImageToCloudinary(
        image,
        process.env.FOLDER_NAME
      );
      image = thumnailImage.secure_url; // Get the secure URL of the image
    } else {
      image = blog.image; // Keep the existing image if no new one is uploaded
    }

    // Update the blog in the database
    const updatedBlog = await blogModel.findByIdAndUpdate(
      blogId,
      {
        title,
        desc,
        type,
        image,
      },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      blog: updatedBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in update blog API!",
    });
  }
};


const getAllBlogsCtrl = async (req, res) => {
  try {

    const blogs = await blogModel.find({});
    if (!blogs) {
      return res.status(400).json({
        success: false,
        message: "No blog found"
      })
    }
    return res.status(200).json({
      success: true,
      totalBlogs: blogs.length,
      blogs
    })
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getting blog api!"
    })
  }
}
const getSingleBlogsCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(400).json({
        success: false,
        message: "No blog found"
      })
    }
    return res.status(200).json({
      success: true,

      blog
    })
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getting single  blog api!"
    })
  }
}
const deleteBlogCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    await blogModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Blog delete successfully!"
    })
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in deleting blog api!"
    })
  }
}
module.exports = { createBlogsCtrl, getAllBlogsCtrl, deleteBlogCtrl, getSingleBlogsCtrl, updateBlogCtrl };