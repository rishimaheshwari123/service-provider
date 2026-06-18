import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Share2, User, Tag, Globe, Eye, Hash } from "lucide-react";
import { getSingleBlogBySlugAPI, getAllBlogsAPI } from "@/service/operations/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SingleBlog = () => {
  const { slug } = useParams();
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
  const getSingleBlog = async (blogSlug) => {
    try {
      setLoading(true);
      const response = await getSingleBlogBySlugAPI(blogSlug);
      if (response) {
        setBlog(response);
        // Get related blogs of the same category
        getRelatedBlogs(response.category || response.type, response._id);
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
  const getRelatedBlogs = async (blogCategory, currentBlogId) => {
    try {
      const response = await getAllBlogsAPI();
      if (response) {
        // Filter blogs of the same category, excluding current blog
        const related = response
          .filter((b) => (b.category || b.type) === blogCategory && b._id !== currentBlogId)
          .slice(0, 3); // Get only 3 related blogs
        setRelatedBlogs(related);
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  useEffect(() => {
    if (slug) {
      getSingleBlog(slug);
    }
  }, [slug]);

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
  const handleRelatedBlogClick = (blogSlug) => {
    navigate(`/blog/${blogSlug}`);
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
    <>
    <Navbar/>
<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-8 gradient-gold text-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            className="mb-6 text-black border-black hover:bg-black hover:text-white"
            onClick={() => navigate("/blogs")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
          <div className="mb-4">
            <Badge className="bg-black text-white mb-4">{blog.category || blog.type}</Badge>
            {blog.published !== undefined && (
              <Badge className={`ml-2 ${blog.published ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {blog.published ? 'Published' : 'Draft'}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">{blog.title}</h1>
          {blog.metaDescription && (
            <p className="text-lg text-gray-800 mb-4">{blog.metaDescription}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-black">
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
              className="text-black border-black hover:bg-black hover:text-white"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Featured Images Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Main Image */}
            <div className="w-full">
              {/* <h3 className="text-lg font-semibold text-black mb-3">Featured Image</h3> */}
              <div className="w-full h-64 lg:h-80 overflow-hidden rounded-lg border shadow-sm">
                <img
                  src={blog.image || "/placeholder.svg?height=400&width=600"}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* OG Image */}
            {blog.ogImage && (
              <div className="w-full">
                {/* <h3 className="text-lg font-semibold text-black mb-3">Social Media Image</h3> */}
                <div className="w-full h-64 lg:h-80 overflow-hidden rounded-lg border shadow-sm">
                  <img
                    src={blog.ogImage}
                    alt={`${blog.title} - Social Media`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div className="px-8 pb-8">
            {/* SEO and Meta Information */}
            {(blog.metaTitle || blog.keywords || blog.canonicalUrl) && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  {/* <Tag className="w-5 h-5 mr-2" />
                  SEO Information */}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blog.metaTitle && (
                    <div>
                      {/* <label className="text-sm font-medium text-gray-700 block mb-1">Meta Title:</label> */}
                      <p className="text-black">{blog.metaTitle}</p>
                    </div>
                  )}
                  {blog.metaDescription && (
                    <div>
                      {/* <label className="text-sm font-medium text-gray-700 block mb-1">Meta Description:</label> */}
                      <p className="text-black">{blog.metaDescription}</p>
                    </div>
                  )}
                  {blog.keywords && (
                    <div className="md:col-span-2">
                      {/* <label className="text-sm font-medium text-gray-700 block mb-2">Keywords:</label> */}
                      <div className="flex flex-wrap gap-2">
                        {blog.keywords.split(',').map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            <Hash className="w-3 h-3 mr-1" />
                            {keyword.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {blog.canonicalUrl && (
                    <div className="md:col-span-2">
                      {/* <label className="text-sm font-medium text-gray-700 block mb-1">Canonical URL:</label> */}
                      <a 
                        href={blog.canonicalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all hover:underline"
                      >
                        {blog.canonicalUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Open Graph Information */}
            {(blog.ogTitle || blog.ogDescription) && (
              <div className="bg-blue-50 rounded-lg p-6 ">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  {/* <Share2 className="w-5 h-5 mr-2" />
                  Social Media Information */}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blog.ogTitle && (
                    <div>
                      {/* <label className="text-sm font-medium text-gray-700 block mb-1">Social Media Title:</label> */}
                      <p className="text-black">{blog.ogTitle}</p>
                    </div>
                  )}
                  {blog.ogDescription && (
                    <div>
                      {/* <label className="text-sm font-medium text-gray-700 block mb-1">Social Media Description:</label> */}
                      <p className="text-black">{blog.ogDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content - Full Width for Long Content */}
            <div className="">
              {/* <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-gray-200 pb-3">Content</h2> */}
              <div 
                className="text-black leading-relaxed text-base sm:text-lg blog-content"
                style={{
                  lineHeight: '1.8',
                  wordSpacing: '0.05em',
                  letterSpacing: '0.01em',
                  hyphens: 'auto',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: blog.desc
                }}
              />
            </div>

            {/* Blog Statistics */}
            <div className="bg-amber-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                {/* <Eye className="w-5 h-5 mr-2" />
                Blog Statistics */}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-black">{blog.desc.split(' ').length}</p>
                  <p className="text-sm text-gray-600">Words</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-black">{calculateReadingTime(blog.desc)}</p>
                  <p className="text-sm text-gray-600">Reading Time</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-black">{blog.desc.length}</p>
                  <p className="text-sm text-gray-600">Characters</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xl font-bold text-black">{formatDate(blog.createdAt)}</p>
                  <p className="text-sm text-gray-600">Published</p>
                </div>
              </div>
            </div>

           
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Card
                  key={relatedBlog._id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleRelatedBlogClick(relatedBlog.slug)}
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
                        {relatedBlog.category || relatedBlog.type}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-black line-clamp-2 mb-2">
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

        
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default SingleBlog;