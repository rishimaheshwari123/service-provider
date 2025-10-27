import { useState } from "react";
import { createBlogAPI } from "@/service/operations/blog";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const AddBlog = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("desc", formData.description);
      formDataToSend.append("image", formData.image);

      const response = await createBlogAPI(formDataToSend);

      if (response) {
        setFormData({
          title: "",
          description: "",
          image: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h6 className="text-blue-600 text-center text-3xl border-b-2 border-blue-600 pb-2">
        Add Blogs
      </h6>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-6 mt-10 max-w-3xl mx-auto"
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

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block font-medium text-gray-700 text-xl mb-2"
          >
            Description: <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            id="description"
            rows="6"
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Image */}
        <div>
          <label
            className="block text-gray-600 text-xl font-bold mb-2"
            htmlFor="image"
          >
            Image:
          </label>
          <input
            className="appearance-none border rounded w-full py-3 px-4 text-gray-600 leading-tight focus:outline-none focus:shadow-outline text-xl"
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-md text-xl hover:bg-blue-700 transition"
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
