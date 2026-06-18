import { useState, useEffect } from "react";
import { createBlogAPI } from "@/service/operations/blog";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { generateSlug, isValidSlug } from "@/utils/blogUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Image as ImageIcon,
  Tag,
  Globe,
  Share2,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AddBlog = () => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "General",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    image: null,
    ogImage: null,
    published: false,
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const { toast } = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getAllCategoriesAPI();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Auto-generate slug when title changes
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
        // Auto-fill meta title if empty
        metaTitle: prev.metaTitle || value,
        ogTitle: prev.ogTitle || value,
      }));
    }
  };

  const handleFileChange = (e: any) => {
    const { name } = e.target;
    const file = e.target.files[0];

    setFormData({
      ...formData,
      [name]: file,
    });

    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'image') {
          setImagePreview(reader.result as string);
        } else if (name === 'ogImage') {
          setOgImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!isValidSlug(formData.slug)) {
      toast({
        title: "Invalid Slug",
        description: "Please enter a valid URL-friendly slug",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("desc", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("metaTitle", formData.metaTitle);
      formDataToSend.append("metaDescription", formData.metaDescription);
      formDataToSend.append("keywords", formData.keywords);
      formDataToSend.append("canonicalUrl", formData.canonicalUrl);
      formDataToSend.append("ogTitle", formData.ogTitle);
      formDataToSend.append("ogDescription", formData.ogDescription);
      formDataToSend.append("published", formData.published.toString());

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      if (formData.ogImage) {
        formDataToSend.append("ogImage", formData.ogImage);
      }

      const response = await createBlogAPI(formDataToSend);

      if (response) {
        toast({
          title: "Success!",
          description: "Blog post created successfully",
        });

        // Reset form
        setFormData({
          title: "",
          slug: "",
          description: "",
          category: "General",
          metaTitle: "",
          metaDescription: "",
          keywords: "",
          canonicalUrl: "",
          ogTitle: "",
          ogDescription: "",
          image: null,
          ogImage: null,
          published: false,
        });
        setImagePreview(null);
        setOgImagePreview(null);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.isBlog) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">You do not have permission to view this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl  md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            Create New Blog Post
          </h1>
          <p className="text-gray-600">Share your insights and stories with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-lg border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the main details of your blog post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging blog title..."
                  required
                  className="text-lg"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-base font-semibold">
                  URL Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="auto-generated-from-title"
                  required
                  className={`font-mono ${formData.slug && !isValidSlug(formData.slug) ? 'border-red-500' : ''
                    }`}
                />
                <div className="flex items-start gap-2 text-sm">
                  {formData.slug && isValidSlug(formData.slug) ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : formData.slug ? (
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : null}
                  <p className={formData.slug && !isValidSlug(formData.slug) ? "text-red-500" : "text-gray-500"}>
                    {formData.slug && !isValidSlug(formData.slug)
                      ? "Slug should only contain lowercase letters, numbers, and hyphens"
                      : "URL-friendly version of the title. Auto-generated but can be edited."}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  Category
                </Label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write your blog content here... (HTML allowed)"
                  required
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500">
                  HTML tags are supported for rich formatting
                </p>
              </div>

              {/* Published Status */}
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="published" className="cursor-pointer flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Publish immediately
                </Label>
                {formData.published && (
                  <Badge variant="default" className="ml-2">Live</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="shadow-lg border-t-4 border-t-purple-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Media
              </CardTitle>
              <CardDescription>
                Upload images for your blog post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Thumbnail Image */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-base font-semibold">
                  Featured Image
                </Label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label htmlFor="image" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 transition-colors text-center">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-gray-600">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="text-gray-600">Click to upload featured image</p>
                            <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* OG Image */}
              <div className="space-y-2">
                <Label htmlFor="ogImage" className="text-base font-semibold">
                  Social Media Image (Open Graph)
                </Label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label htmlFor="ogImage" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 transition-colors text-center">
                        {ogImagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={ogImagePreview}
                              alt="OG Preview"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-gray-600">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Share2 className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="text-gray-600">Click to upload social media image</p>
                            <p className="text-sm text-gray-500">Recommended: 1200x630px</p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="ogImage"
                      name="ogImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card className="shadow-lg border-t-4 border-t-green-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Optimize your blog post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meta Title */}
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="text-base font-semibold">
                  Meta Title
                </Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="SEO-optimized title"
                  maxLength={60}
                />
                <p className="text-sm text-gray-500">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="text-base font-semibold">
                  Meta Description
                </Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="Brief description for search results"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-sm text-gray-500">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-base font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Keywords
                </Label>
                <Input
                  id="keywords"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-sm text-gray-500">
                  Separate keywords with commas
                </p>
              </div>

              {/* Canonical URL */}
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl" className="text-base font-semibold">
                  Canonical URL
                </Label>
                <Input
                  id="canonicalUrl"
                  name="canonicalUrl"
                  type="url"
                  value={formData.canonicalUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/blog/post-slug"
                />
              </div>
            </CardContent>
          </Card>

          {/* Open Graph Settings */}
          <Card className="shadow-lg border-t-4 border-t-orange-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-orange-600" />
                Social Media (Open Graph)
              </CardTitle>
              <CardDescription>
                Control how your blog appears when shared on social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* OG Title */}
              <div className="space-y-2">
                <Label htmlFor="ogTitle" className="text-base font-semibold">
                  Social Media Title
                </Label>
                <Input
                  id="ogTitle"
                  name="ogTitle"
                  value={formData.ogTitle}
                  onChange={handleChange}
                  placeholder="Title for social media sharing"
                />
              </div>

              {/* OG Description */}
              <div className="space-y-2">
                <Label htmlFor="ogDescription" className="text-base font-semibold">
                  Social Media Description
                </Label>
                <Textarea
                  id="ogDescription"
                  name="ogDescription"
                  value={formData.ogDescription}
                  onChange={handleChange}
                  placeholder="Description for social media sharing"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6 pb-12">
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Blog Post...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Blog Post
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;
