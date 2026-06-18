import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, ArrowRight, Clock } from "lucide-react";
import { getAllBlogsAPI } from "@/service/operations/blog";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import PromoBanner from "@/components/home/PromoBanner";
import SEO from "@/components/common/SEO";
import StructuredData, { generateBreadcrumbSchema } from "@/components/common/StructuredData";
import { seoConfig } from "@/utils/seoConfig";

const Blogs = () => {
  const navigate = useNavigate();
  
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.meragharsansaar.com/" },
    { name: "Blog", url: "https://www.meragharsansaar.com/blogs" }
  ]);
  
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const fetchBlogs = async (targetPage = page) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: targetPage,
        limit: 9,
        published: true,
        sortBy: sortBy,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== "all-categories") params.category = selectedCategory;

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
      console.error("Error fetching blogs:", error);
      setError("Failed to load blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAllCategories = async () => {
    try {
      const response = await getAllCategoriesAPI();
      if (response) {
        setCategories(response);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Trigger paginated load when filters or sort change (resets to page 1)
  useEffect(() => {
    fetchBlogs(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Load categories once on mount
  useEffect(() => {
    getAllCategories();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchBlogs(newPage);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate reading time (approximate)
  const calculateReadingTime = (text) => {
    if (!text) return "1 min read";
    const wordsPerMinute = 200;
    const words = text.split(" ").length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Handle blog click
  const handleBlogClick = (blogSlug) => {
    navigate(`/blog/${blogSlug}`);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setSelectedCategory("all-categories");
    setSortBy("newest");
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchBlogs(page)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title={seoConfig.blogs.title}
        description={seoConfig.blogs.description}
        keywords={seoConfig.blogs.keywords}
        canonical={seoConfig.blogs.canonical}
        ogImage={seoConfig.blogs.ogImage}
      />
      
      {/* Structured Data */}
      <StructuredData data={breadcrumb} />
      
      <Navbar />
      <PromoBanner/>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="py-16 text-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Latest <span className="text-yellow-600">Updates</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
              Stay updated with the latest <span className="font-semibold text-yellow-600">service provider insights</span>, 
              industry updates, and market trends.
            </p>

            {/* Keywords */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span className="border border-gray-200 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow transition">
                Best service provider in Sagar
              </span>
              <span className="border border-gray-200 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow transition">
                Online service provider near me
              </span>
            </div>

          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSearchTerm(searchInput);
                  }}
                  className="flex space-x-2"
                >
                  <Input
                    placeholder="Search blogs..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-12 text-black placeholder:text-gray-500 flex-1 bg-white"
                  />
                  <Button
                    type="submit"
                    className="h-12 px-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold rounded-md transition-colors shadow-sm"
                  >
                    Search
                  </Button>
                </form>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory !== "all-categories") && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all-categories") && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Active Filters:
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800"
                  >
                    Search: {searchTerm}
                  </Badge>
                )}
                {selectedCategory !== "all-categories" && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800"
                  >
                    Category: {selectedCategory}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {totalBlogs} {totalBlogs === 1 ? "Blog" : "Blogs"} Found
            </h2>
          </div>

          {/* Blog Grid */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              </div>
            )}

            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <Card
                    key={blog._id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white cursor-pointer"
                    onClick={() => handleBlogClick(blog.slug)}
                  >
                    <div className="relative">
                      <img
                        src={
                          blog.image || "/placeholder.svg?height=300&width=400"
                        }
                        alt={blog.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-amber-500 text-white">
                          {blog.category || blog.type}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 mb-2">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {blog.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(blog.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {calculateReadingTime(blog.desc)}
                        </span>
                      </div>

                      <div className="border-t pt-4">
                        <Button
                          className="w-full gradient-gold text-white group-hover:bg-amber-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlogClick(blog.slug);
                          }}
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-lg p-4 mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-100">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Showing <span className="font-semibold text-gray-900">{((page - 1) * 9) + 1}</span> to{" "}
                <span className="font-semibold text-gray-900">{Math.min(page * 9, totalBlogs)}</span> of{" "}
                <span className="font-semibold text-gray-900">{totalBlogs}</span> blogs
              </div>
              <div className="flex items-center justify-center space-x-1.5">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    page === 1
                      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 active:bg-amber-100"
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
                        className={`w-10 h-10 rounded-md text-sm font-bold border transition-all ${
                          page === pageNum
                            ? "bg-amber-500 border-amber-500 text-white shadow-md"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 active:bg-amber-100"
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
                      <span key={pageNum} className="text-gray-400 px-1 font-bold">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    page === totalPages
                      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 active:bg-amber-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blogs;
