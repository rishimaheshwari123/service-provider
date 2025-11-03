import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import Dropzone from "react-dropzone";
import { createPropertyAPI } from "@/service/operations/property";
import { getPurchasedCategoriesAPI } from "@/service/operations/category";
import { imageUpload } from "@/service/operations/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VendorAddService = () => {
  const { id } = useParams<{ id: string }>(); // vendorId for admin
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    type: "",
    category: "",
    description: "",
    vendor: "",
  });

  const [images, setImages] = useState<any[]>([]);
  const [myCategories, setMyCategories] = useState<any[]>([]);

  // Set vendor ID based on role
  useEffect(() => {
    if (user?.role === "vendor" && user._id) {
      setFormData((prev) => ({ ...prev, vendor: user._id }));
    } else if (user?.role === "admin" && id) {
      setFormData((prev) => ({ ...prev, vendor: id }));
    }
  }, [user, id]);

  // Load purchased categories
  useEffect(() => {
    const loadCategories = async () => {
      const vendorId = user?.role === "vendor" ? user._id : id;
      if (!vendorId) return;

      const cats = await getPurchasedCategoriesAPI(vendorId);
      setMyCategories(cats);
    };
    loadCategories();
  }, [user, id]);

  // Image upload
  const uploadImage = async (acceptedFiles: File[]) => {
    try {
      const response = await imageUpload(acceptedFiles);
      const uploadedImages = response?.map((img: any) => ({
        public_id: img.asset_id,
        url: img.url,
      }));
      setImages((prev) => [...prev, ...uploadedImages]);
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed");
    }
  };

  const removeImage = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.public_id !== publicId));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if category is selected
    if (!formData.category) {
      toast.error(
        "Please purchase a service category before adding a service."
      );

      if (user?.role === "vendor") {
        navigate("/vendor/purchase-categories");
      } else if (user?.role === "admin") {
        navigate("/admin/categories");
      }

      return; // stop form submission
    }

    const dataToSend = {
      ...formData,
      images: JSON.stringify(images),
    };

    try {
      const response = await createPropertyAPI(dataToSend);
      if (response?.data?.success) {
        toast.success("Service added successfully!");
        if (user?.role === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          navigate("/admin/vendors");
        }
      } else {
        toast.error(response?.data?.message || "Failed to add service");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("An error occurred while adding the service.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="ml-4 text-lg font-semibold">
          {user?.role === "vendor" ? "Vendor Dashboard" : "Admin Panel"}
        </h1>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Service
            </h1>
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  user?.role === "vendor"
                    ? "/vendor/dashboard"
                    : "/admin/vendors"
                )
              }
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Service Name</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter service name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price / Charges</Label>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter service charges (e.g. ₹500/hour)"
                    required
                  />
                </div>
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Service Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location (e.g. Mumbai, Delhi)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Service Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Service</SelectItem>
                      <SelectItem value="online">Online Service</SelectItem>
                      <SelectItem value="on-site">On-site Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        myCategories.length
                          ? "Select category"
                          : "No purchased categories"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {myCategories.map((c) => (
                      <SelectItem key={c._id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Images */}
              <div className="mb-6">
                <Label>Service Images</Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
                  <Dropzone onDrop={uploadImage}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="cursor-pointer">
                        <input {...getInputProps()} />
                        <p className="text-blue-500">
                          Drag & drop images here, or click to select
                        </p>
                      </div>
                    )}
                  </Dropzone>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => removeImage(image.public_id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          ✕
                        </button>
                        <img
                          src={image.url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Service Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your service in detail..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 text-white">
                Add Service
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAddService;
