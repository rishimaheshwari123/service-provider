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

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [sortBy, setSortBy] = useState("newest");

  // Extract unique blog categories
  const extractUniqueCategories = (blogs) => {
    const categories = [...new Set(blogs.map((blog) => blog.category).filter(Boolean))];
    return categories;
  };

  const getAllBlogs = async () => {
    try {
      setLoading(true);
      const response = await getAllBlogsAPI();
      if (response) {
        setBlogs(response);
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

  useEffect(() => {
    getAllBlogs();
    getAllCategories();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate reading time (approximate)
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(" ").length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Filter and sort blogs
  const filteredAndSortedBlogs = blogs
    .filter((blog) => {
      const matchesSearch =
        searchTerm === "" ||
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.desc?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all-categories" ||
        blog.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Handle blog click
  const handleBlogClick = (blogSlug) => {
    navigate(`/blog/${blogSlug}`);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all-categories");
    setSortBy("newest");
  };

  if (loading) {
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
          <Button onClick={getAllBlogs}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
                {/* <HeroSection /> */}
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
                <Input
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-black placeholder:text-gray-500"
                />
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
              {filteredAndSortedBlogs.length} Blogs Found
            </h2>
          </div>

          {/* Blog Grid */}
          {filteredAndSortedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedBlogs.map((blog) => (
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

          {/* Load More */}
         
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blogs;
