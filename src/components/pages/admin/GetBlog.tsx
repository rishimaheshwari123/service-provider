import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaEye, FaCalendar, FaTag, FaGlobe, FaImage } from "react-icons/fa";
import { MdPublish, MdUnpublished } from "react-icons/md";
import BlogPopup from "./BlogGroup";
import { getAllBlogsAPI, deleteBlogAPI } from "@/service/operations/blog";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const GetBlog = () => {
  const [blog, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [categorySearchText, setCategorySearchText] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [stats, setStats] = useState({ total: 0, published: 0 });
  const [allCategories, setAllCategories] = useState([]);
  const limit = 9;

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

  const fetchStatsAndCategories = async () => {
    try {
      const res = await getAllBlogsAPI();
      if (res && Array.isArray(res)) {
        setStats({
          total: res.length,
          published: res.filter(b => b.published).length
        });
        const cats = [...new Set(res.map(b => b.category || b.type).filter(Boolean))];
        setAllCategories(cats);
      }
    } catch (error) {
      console.error("Error fetching stats and categories:", error);
    }
  };

  const getAllBlogs = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit: limit,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterCategory !== "all") params.category = filterCategory;
      if (filterStatus !== "all") params.published = filterStatus === "published";
      
      const response = await getAllBlogsAPI(params);
      if (response && response.success) {
        setBlogs(response.blogs || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalBlogs(response.pagination?.total || 0);
        setPage(response.pagination?.current || targetPage);
      } else {
        setBlogs([]);
        setTotalPages(1);
        setTotalBlogs(0);
      }
    } catch (error) {
      console.log("Something went wrong", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const res = await deleteBlogAPI(id);
        getAllBlogs(page);
        fetchStatsAndCategories();
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Trigger paginated load when filters change (resets to page 1)
  useEffect(() => {
    getAllBlogs(1);
  }, [searchTerm, filterCategory, filterStatus]);

  // Fetch general stats and list of categories once on mount
  useEffect(() => {
    fetchStatsAndCategories();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      getAllBlogs(newPage);
    }
  };

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

  const uniqueCategories = allCategories;

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
                  <span className="text-blue-600 font-semibold">{stats.total}</span>
                  <span className="text-blue-500 ml-1">Total Blogs</span>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-green-600 font-semibold">
                    {stats.published}
                  </span>
                  <span className="text-green-500 ml-1">Published</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchTerm(searchInput);
                }}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white animate-none flex-1"
                />
                <button
                  type="submit"
                  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-md transition-colors flex items-center justify-center shadow-sm whitespace-nowrap"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <Select
                value={filterCategory}
                onValueChange={(val) => {
                  setFilterCategory(val);
                  setCategorySearchText("");
                }}
              >
                <SelectTrigger className="w-full h-10 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md max-h-60 overflow-y-auto z-[200]">
                  {/* Category Search Input */}
                  <div className="px-2 py-1.5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={categorySearchText}
                      onChange={(e) => setCategorySearchText(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()} // Stop Radix from closing popover on Space/Enter keys
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories
                    .filter(category => 
                      category?.toLowerCase().includes(categorySearchText.toLowerCase())
                    )
                    .map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))
                  }
                  {uniqueCategories.filter(category => 
                    category?.toLowerCase().includes(categorySearchText.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No category found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <Select
                value={filterStatus}
                onValueChange={(val) => setFilterStatus(val)}
              >
                <SelectTrigger className="w-full h-10 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md z-[200]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchTerm("");
                  setFilterCategory("all");
                  setFilterStatus("all");
                  setCategorySearchText("");
                }}
                className="w-full h-10 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Blog Cards */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {blog.length > 0 ? (
              blog.map((blogItem) => (
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
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Showing <span className="font-semibold text-gray-900">{((page - 1) * limit) + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">{Math.min(page * limit, totalBlogs)}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalBlogs}</span> blogs
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  page === 1
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                Previous
              </button>
              
              {/* Pagination Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - page) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-md text-sm font-semibold border transition-all ${
                        page === pageNum
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === 2 && page > 3) ||
                  (pageNum === totalPages - 1 && page < totalPages - 2)
                ) {
                  return (
                    <span key={pageNum} className="text-gray-400 px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  page === totalPages
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <BlogPopup
            isOpen={isModalOpen}
            blogId={selectedBlogId}
            onClose={closeModal}
            getAllBlogs={() => {
              getAllBlogs(page);
              fetchStatsAndCategories();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GetBlog;
