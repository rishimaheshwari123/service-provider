import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaEye, FaCalendar, FaTag, FaGlobe, FaImage } from "react-icons/fa";
import { MdPublish, MdUnpublished } from "react-icons/md";
import BlogPopup from "./BlogGroup";
import { getAllBlogsAPI, deleteBlogAPI } from "@/service/operations/blog";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const GetBlog = () => {
  const [blog, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  // Open the modal with the selected blog ID (for editing)
  const openModal = (blogId) => {
    setSelectedBlogId(blogId);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlogId(null);
  };

  const getAllBlogs = async () => {
    try {
      const response = await getAllBlogsAPI();
      if (response) {
        setBlogs(response);
      }
    } catch (error) {
      console.log("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const res = await deleteBlogAPI(id);
        setBlogs(blog.filter((event) => event._id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    getAllBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Filter blogs based on search and filters
  const filteredBlogs = blog.filter((blogItem) => {
    const matchesSearch = 
      blogItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blogItem.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blogItem.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || 
      (blogItem.category || blogItem.type)?.toLowerCase() === filterCategory.toLowerCase();
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "published" ? blogItem.published : !blogItem.published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const uniqueCategories = [...new Set(blog.map(b => b.category || b.type).filter(Boolean))];

  if (!user?.isBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="mt-2 text-gray-600">Manage all your blog posts in one place</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-600 font-semibold">{blog.length}</span>
                  <span className="text-blue-500 ml-1">Total Blogs</span>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-green-600 font-semibold">
                    {blog.filter(b => b.published).length}
                  </span>
                  <span className="text-green-500 ml-1">Published</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                  setFilterStatus("all");
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blogItem) => (
              <div key={blogItem._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {blogItem.image ? (
                    <img
                      src={blogItem.image}
                      alt={blogItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImage className="text-gray-400 text-4xl" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {blogItem.published ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <MdPublish className="mr-1" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <MdUnpublished className="mr-1" />
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  {(blogItem.category || blogItem.type) && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaTag className="mr-1" />
                        {blogItem.category || blogItem.type}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendar className="mr-1" />
                      {formatDate(blogItem.createdAt)}
                    </div>
                    {blogItem.slug && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FaGlobe className="mr-1" />
                        <span className="truncate max-w-20">{blogItem.slug}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blogItem.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {truncateText(blogItem.desc, 120)}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    {blogItem.metaTitle && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Meta Title:</span> {truncateText(blogItem.metaTitle, 50)}
                      </div>
                    )}
                    {blogItem.keywords && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Keywords:</span> {truncateText(blogItem.keywords, 50)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(blogItem._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      
                      {blogItem.slug && (
                        <button
                          onClick={() => window.open(`/blog/${blogItem.slug}`, '_blank')}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <FaEye className="mr-1" />
                          View
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDelete(blogItem._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <FaTrashAlt className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterCategory !== "all" || filterStatus !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "Create your first blog post to get started"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
          <BlogPopup
            isOpen={isModalOpen}
            blogId={selectedBlogId}
            onClose={closeModal}
            getAllBlogs={getAllBlogs}
          />
        )}
      </div>
    </div>
  );
};

export default GetBlog;
