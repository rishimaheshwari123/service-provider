const { uploadImageToCloudinary } = require("../config/s3Uploader");
const blogModel = require("../models/blogModel");

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existingBlog = await blogModel.findOne(query);
    if (!existingBlog) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

const createBlogsCtrl = async (req, res) => {
  try {
    const { 
      title, 
      desc, 
      slug: customSlug,
      category,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      published
    } = req.body;
    
    const image = req.files?.image;
    const ogImage = req.files?.ogImage;

    if (!title || !desc || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, and image"
      });
    }

    // Generate slug from title or use custom slug
    let slug = customSlug || generateSlug(title);
    slug = await ensureUniqueSlug(slug);

    // Upload main image
    const thumbnailImage = await uploadImageToCloudinary(image, process.env.FOLDER_NAME);
    
    // Upload OG image if provided
    let ogImageUrl = null;
    if (ogImage) {
      const uploadedOgImage = await uploadImageToCloudinary(ogImage, process.env.FOLDER_NAME);
      ogImageUrl = uploadedOgImage.secure_url;
    }

    const blogData = {
      title,
      slug,
      desc,
      category: category || 'General',
      image: thumbnailImage.secure_url,
      metaTitle: metaTitle || title,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle: ogTitle || title,
      ogDescription,
      ogImage: ogImageUrl,
      published: published === 'true' || published === true,
      type: category || 'General' // Keep for backward compatibility
    };

    const blog = await blogModel.create(blogData);

    return res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      blog
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in create blog api!"
    });
  }
};

const updateBlogCtrl = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { 
      title, 
      desc, 
      type,
      category,
      slug: customSlug,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      published
    } = req.body;
    
    let image = req.files?.image;
    let ogImage = req.files?.ogImage;

    // Validate if required fields are present
    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and description",
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

    // Handle slug update
    let slug = blog.slug;
    if (title !== blog.title || customSlug) {
      const newSlug = customSlug || generateSlug(title);
      slug = await ensureUniqueSlug(newSlug, blogId);
    }

    // Handle main image upload
    let imageUrl = blog.image;
    if (image) {
      const thumbnailImage = await uploadImageToCloudinary(image, process.env.FOLDER_NAME);
      imageUrl = thumbnailImage.secure_url;
    }

    // Handle OG image upload
    let ogImageUrl = blog.ogImage;
    if (ogImage) {
      const uploadedOgImage = await uploadImageToCloudinary(ogImage, process.env.FOLDER_NAME);
      ogImageUrl = uploadedOgImage.secure_url;
    }

    // Update the blog in the database
    const updatedBlog = await blogModel.findByIdAndUpdate(
      blogId,
      {
        title,
        slug,
        desc,
        category: category || type || blog.category,
        type: category || type || blog.type,
        image: imageUrl,
        metaTitle: metaTitle || title,
        metaDescription,
        keywords,
        canonicalUrl,
        ogTitle: ogTitle || title,
        ogDescription,
        ogImage: ogImageUrl,
        published: published !== undefined ? (published === 'true' || published === true) : blog.published
      },
      { new: true }
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
    const { page = 1, limit = 100, category, published, search } = req.query;
    
    // Build query
    const query = {};
    
    if (category && category !== 'all-types') {
      query.category = category;
    }
    
    if (published !== undefined) {
      query.published = published === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await blogModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title slug desc category image metaTitle metaDescription published createdAt type');
    
    const total = await blogModel.countDocuments(query);

    if (!blogs || blogs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No blogs found",
        totalBlogs: 0,
        blogs: [],
        pagination: {
          current: parseInt(page),
          pages: 0,
          total: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      totalBlogs: blogs.length,
      blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting blog api!"
    });
  }
};

const getSingleBlogsCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      blog
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting single blog api!"
    });
  }
};

// New function to get blog by slug
const getBlogBySlugCtrl = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await blogModel.findOne({ slug, published: true });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      blog
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting blog by slug!"
    });
  }
};

const deleteBlogCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    await blogModel.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully!"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in deleting blog api!"
    });
  }
};

module.exports = { 
  createBlogsCtrl, 
  getAllBlogsCtrl, 
  deleteBlogCtrl, 
  getSingleBlogsCtrl, 
  getBlogBySlugCtrl,
  updateBlogCtrl 
};