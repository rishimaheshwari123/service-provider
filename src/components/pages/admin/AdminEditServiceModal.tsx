import { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { updatePropertyAPI } from "@/service/operations/property";
import { imageUpload } from "@/service/operations/image";
import { getAllCategoriesAPI } from "@/service/operations/category";

interface Image {
  public_id: string;
  url: string;
}

interface Service {
  _id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  description?: string;
  images?: Image[];
  vendor: string | {
    _id: string;
    name: string;
    company: string;
    phone: string;
  };
  status?: string;
  createdAt?: string;
}

interface AdminEditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onSave: (updatedService: Service) => void;
  fetchServices: () => void;
}

export const AdminEditServiceModal = ({
  isOpen,
  onClose,
  service,
  onSave,
  fetchServices,
}: AdminEditServiceModalProps) => {
  const [formData, setFormData] = useState<Service>({
    _id: "",
    title: "",
    price: "",
    location: "",
    type: "",
    category: "",
    description: "",
    images: [],
    vendor: "",
    status: "active",
  });
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (service) {
      setFormData({
        _id: service._id,
        title: service.title || "",
        price: service.price || "",
        location: service.location || "",
        type: service.type || "",
        category: service.category?._id || service.category || "",
        description: service.description || "",
        images: service.images || [],
        vendor: typeof service.vendor === 'string' ? service.vendor : service.vendor._id || "",
        status: service.status || "active",
      });
      setImages(service.images || []);
    }
  }, [service]);

  // Load all categories for admin (they can assign any category)
  useEffect(() => {
    const loadCategories = async () => {
      const allCats = await getAllCategoriesAPI();
      setCategories(allCats);
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const handleInputChange = (
    field: keyof Service,
    value: string | number | File
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadImages = async (acceptedFiles: File[]) => {
    try {
      const response = await imageUpload(acceptedFiles);
      if (response) {
        const uploadedImages = response.map((img: any) => ({
          public_id: img.asset_id,
          url: img.url,
        }));
        setImages((prev) => [...prev, ...uploadedImages]);
        toast.success("Images uploaded successfully!");
      }
    } catch {
      toast.error("Image upload failed!");
    }
  };

  const removeImage = (publicId: string) => {
    setImages(images.filter((img) => img.public_id !== publicId));
  };

  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.price ||
      !formData.location ||
      !formData.type ||
      !formData.category
    ) {
      toast.error("Please fill all required fields!");
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("price", formData.price);
      dataToSend.append("location", formData.location);
      dataToSend.append("type", formData.type);
      dataToSend.append("category", formData.category);
      if (formData.description)
        dataToSend.append("description", formData.description);
      if (formData.vendor) {
        if (typeof formData.vendor === 'string') {
          dataToSend.append("vendor", formData.vendor);
        } else {
          dataToSend.append("vendor", formData.vendor._id);
        }
      }
      if (formData.status) dataToSend.append("status", formData.status);
      
      // Always send images array, even if empty (this allows removal of all images)
      dataToSend.append("images", JSON.stringify(images));

      const response = await updatePropertyAPI(service?._id, dataToSend);
      if (response?.success) {
        onSave(response.property);
        toast.success("Service updated successfully!");
        fetchServices();
        onClose();
      } else {
        toast.error(response?.message || "Failed to update service");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service (Admin)</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div>
              <Label>Service Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter service title"
              />
            </div>

            <div>
              <Label>Location *</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price *</Label>
                <Input
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="e.g., ₹500"
                />
              </div>

              <div>
                <Label>Service Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Service</SelectItem>
                    <SelectItem value="online">Online Service</SelectItem>
                    <SelectItem value="on-site">On-site Service</SelectItem>
                    <SelectItem value="on-site-home">On-site & Home Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Loading categories...
                  </p>
                )}
              </div>

              <div>
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the service..."
                rows={3}
              />
            </div>

            <div>
              <Label>Service Images</Label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                <Dropzone
                  onDrop={(acceptedFiles) => uploadImages(acceptedFiles)}
                  accept={{
                    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
                  }}
                  multiple
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="cursor-pointer">
                      <input {...getInputProps()} />
                      <p className="text-blue-500">
                        Drag & drop or click to upload service images
                      </p>
                    </div>
                  )}
                </Dropzone>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <button
                        type="button"
                        onClick={() => removeImage(img.public_id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                      <img
                        src={img.url}
                        alt="Service"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};