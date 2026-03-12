import { useState, useEffect } from "react";
import { createBlogAPI } from "@/service/operations/blog";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { generateSlug, isValidSlug } from "@/utils/blogUtils";

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

  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getAllCategoriesAPI();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
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

  const handleFileChange = (e) => {
    const { name } = e.target;
    setFormData({
      ...formData,
      [name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!user?.isBlog) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <>
      <h6 className="text-blue-600 text-center text-3xl border-b-2 border-blue-600 pb-2">
        Add Blogs
      </h6>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-6 mt-10 max-w-4xl mx-auto"
      >
        {/* Title */}
        <div>
          <label
            className="block text-gray-600 text-xl font-bold mb-2"
            htmlFor="title"
          >
            Title: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label
            className="block text-gray-600 text-xl font-bold mb-2"
            htmlFor="slug"
          >
            Slug: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl ${
              formData.slug && !isValidSlug(formData.slug) ? 'border-red-500' : ''
            }`}
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="auto-generated-from-title"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL-friendly version of the title. Auto-generated but can be edited.
          </p>
          {formData.slug && !isValidSlug(formData.slug) && (
            <p className="text-sm text-red-500 mt-1">
              Slug should only contain lowercase letters, numbers, and hyphens. No spaces or special characters.
            </p>
          )}
        </div>

        {/* Thumbnail Image */}
        <div>
          <label
            className="block text-gray-600 text-xl font-bold mb-2"
            htmlFor="image"
          >
            Thumbnail:
          </label>
          <input
            className="appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl"
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500 mt-1">
            Select an image or paste image URL
          </p>
        </div>

        {/* Category */}
        <div>
          <label
            className="block text-gray-600 text-xl font-bold mb-2"
            htmlFor="category"
          >
            Category:
          </label>
          {loadingCategories ? (
            <div className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl">
              Loading categories...
            </div>
          ) : (
            <select
              name="category"
              id="category"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="General">General</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="description"
            className="block font-medium text-gray-700 text-xl mb-2"
          >
            Content (HTML allowed): <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            id="description"
            rows={8}
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold text-gray-700 mb-4">SEO Settings</h3>
          
          {/* Meta Title */}
          <div className="mb-4">
            <label
              className="block text-gray-600 text-lg font-bold mb-2"
              htmlFor="metaTitle"
            >
              Meta Title:
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              name="metaTitle"
              id="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              maxLength={60}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.metaTitle.length}/60 characters
            </p>
          </div>

          {/* Meta Description */}
          <div className="mb-4">
            <label
              className="block text-gray-600 text-lg font-bold mb-2"
              htmlFor="metaDescription"
            >
              Meta Description:
            </label>
            <textarea
              name="metaDescription"
              id="metaDescription"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.metaDescription}
              onChange={handleChange}
              maxLength={160}
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              {formData.metaDescription.length}/160 characters
            </p>
          </div>

          {/* Keywords */}
          <div className="mb-4">
            <label
              className="block text-gray-600 text-lg font-bold mb-2"
              htmlFor="keywords"
            >
              Keywords (comma separated):
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              name="keywords"
              id="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="real estate, property, investment"
            />
          </div>

          {/* Canonical URL */}
          <div className="mb-4">
            <label
              className="block text-gray-600 text-lg font-bold mb-2"
              htmlFor="canonicalUrl"
            >
              Canonical URL:
            </label>
            <input
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              name="canonicalUrl"
              id="canonicalUrl"
              value={formData.canonicalUrl}
              onChange={handleChange}
              placeholder="https://example.com/blog/post-slug"
            />
          </div>
        </div>

        {/* Open Graph Section */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Open Graph (Social Media)</h3>
          
          {/* OG Title */}
          <div className="mb-4">
            <label
              className="block text-gray-600 text-lg font-bold mb-2"
              htmlFor="ogTitle"
            >
              OG Title:
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              name="ogTitle"
              id="ogTitle"
              value={formData.ogTitle}
              onChange={handleChange}
            />
          </div>

          {/* OG Description */}
          <div className="mb-4">
            <label
              className="block text-gray-600 text-lg font-bold mb-2"
              htmlFor="ogDescription"
            >
              OG Description:
            </label>
            <textarea
              name="ogDescription"
              id="ogDescription"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.ogDescription}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* OG Image */}
          <div className="mb-4">
            <label
              className="block text-gray-600 text-lg font-bold mb-2"
              htmlFor="ogImage"
            >
              OG Image:
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              id="ogImage"
              name="ogImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              Select an image for social media sharing
            </p>
          </div>
        </div>

        {/* Published Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="text-lg text-gray-700">
            Published
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-md text-xl hover:bg-blue-700 transition font-semibold"
            type="submit"
          >
            Create Blog
          </button>
        </div>
      </form>
    </>
  );
};

export default AddBlog;
