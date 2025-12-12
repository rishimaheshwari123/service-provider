"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Share2, User } from "lucide-react";
import { getSingleBlogAPI, getAllBlogsAPI } from "@/service/operations/blog";

const SingleBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate reading time
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(" ").length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Get single blog
  const getSingleBlog = async (blogId) => {
    try {
      setLoading(true);
      const response = await getSingleBlogAPI(blogId);
      if (response) {
        setBlog(response);
        // Get related blogs of the same type
        getRelatedBlogs(response.type, blogId);
      } else {
        throw new Error("Blog not found");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setError("Failed to load blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get related blogs
  const getRelatedBlogs = async (blogType, currentBlogId) => {
    try {
      const response = await getAllBlogsAPI();
      if (response) {
        // Filter blogs of the same type, excluding current blog
        const related = response
          .filter((b) => b.type === blogType && b._id !== currentBlogId)
          .slice(0, 3); // Get only 3 related blogs
        setRelatedBlogs(related);
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  useEffect(() => {
    if (id) {
      getSingleBlog(id);
    }
  }, [id]);

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.desc,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Handle related blog click
  const handleRelatedBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-black mb-4">{error || "Blog not found"}</p>
          <Button onClick={() => navigate("/blogs")}>Back to Blogs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-8 gradient-gold text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            className="mb-6 text-black border-white hover:bg-white hover:text-amber-600"
            onClick={() => navigate("/blogs")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
          <div className="mb-4">
            <Badge className="bg-white text-amber-600 mb-4">{blog.type}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="flex items-center space-x-6 text-sm">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(blog.createdAt)}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {calculateReadingTime(blog.desc)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-black border-white hover:bg-white hover:text-amber-600"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Featured Image */}
          <div className="w-full h-96 overflow-hidden">
            <img
              src={blog.image || "/placeholder.svg?height=400&width=800"}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Blog Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {blog.desc}
              </p>
            </div>

            {/* Author Info */}
            <div className="border-t pt-6 mt-8">
              <div className="flex items-center">
                <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center text-white text-lg font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-gray-900">
                    Real Estate Expert
                  </p>
                  <p className="text-gray-600">
                    Published on {formatDate(blog.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Card
                  key={relatedBlog._id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleRelatedBlogClick(relatedBlog._id)}
                >
                  <div className="relative">
                    <img
                      src={
                        relatedBlog.image ||
                        "/placeholder.svg?height=200&width=300"
                      }
                      alt={relatedBlog.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-amber-500 text-white text-xs">
                        {relatedBlog.type}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {relatedBlog.desc}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(relatedBlog.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Looking for Your Dream Property?
          </h3>
          <p className="text-gray-600 mb-6">
            Explore our extensive collection of properties and find the perfect
            home for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gradient-gold text-white"
              onClick={() => navigate("/properties")}
            >
              Browse Properties
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBlog;
