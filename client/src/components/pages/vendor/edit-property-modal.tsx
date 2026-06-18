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
import { vendorUpdatePropertyAPI } from "@/service/operations/property";
import { imageUpload } from "@/service/operations/image";
import { getPurchasedCategoriesAPI } from "@/service/operations/category";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

interface Image {
  public_id: string;
  url: string;
  _id?: string; // MongoDB _id for existing images
}

interface Service {
  _id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string | { _id: string; name: string };
  description?: string;
  images?: Image[];
  vendor: string;
}

interface ServiceFormData {
  _id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  description?: string;
  images?: Image[];
  vendor: string;
}

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  fetchServices: () => void;
}

export const EditServiceModal = ({
  isOpen,
  onClose,
  service,
  fetchServices,
}: EditServiceModalProps) => {
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const [formData, setFormData] = useState<ServiceFormData>({
    _id: "",
    title: "",
    price: "",
    location: "",
    type: "",
    category: "",
    description: "",
    images: [],
    vendor: "",
  });
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (service) {
      // Extract category ID whether it's a string or object
      const categoryId = typeof service.category === 'string' 
        ? service.category 
        : service.category?._id || "";
      
      setFormData({
        _id: service._id,
        title: service.title || "",
        price: service.price || "",
        location: service.location || "",
        type: service.type || "",
        category: categoryId,
        description: service.description || "",
        images: service.images || [],
        vendor: service.vendor || "",
      });
      
      // Process images - use _id as public_id for existing images
      const processedImages = (service.images || []).map((img) => ({
        public_id: img._id || img.public_id || img.url, // Use _id as the unique identifier
        url: img.url,
        _id: img._id,
      }));
      
      console.log('Loading existing images:', processedImages);
      setImages(processedImages);
    }
  }, [service]);

  // Load purchased categories
  useEffect(() => {
    const loadCategories = async () => {
      if (user?._id) {
        const cats = await getPurchasedCategoriesAPI(user._id);
        setCategories(cats);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [user, isOpen]);

  const handleInputChange = (
    field: keyof ServiceFormData,
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
        const uploadedImages = response.map((img: any, index: number) => ({
          public_id: img.asset_id || img.public_id || `uploaded-${index}-${Date.now()}`,
          url: img.url,
          // New uploads don't have _id yet
        }));
        console.log('Uploading new images:', uploadedImages);
        setImages((prev) => {
          const combined = [...prev, ...uploadedImages];
          console.log('Combined images after upload:', combined);
          return combined;
        });
        toast.success("Images uploaded successfully!");
      }
    } catch {
      toast.error("Image upload failed!");
    }
  };

  const removeImage = (publicId: string) => {
    console.log('Removing image with public_id:', publicId);
    console.log('Current images:', images.map(img => ({ public_id: img.public_id, url: img.url })));
    setImages((prevImages) => {
      const filtered = prevImages.filter((img) => img.public_id !== publicId);
      console.log('Images after removal:', filtered.map(img => ({ public_id: img.public_id, url: img.url })));
      return filtered;
    });
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
      if (formData.vendor) dataToSend.append("vendor", formData.vendor);
      
      // Always send images array, even if empty (this allows removal of all images)
      dataToSend.append("images", JSON.stringify(images));

      const response = await vendorUpdatePropertyAPI(service?._id, dataToSend);
      if (response?.success) {
        toast.success(response?.message || "Update request submitted successfully!");
        fetchServices();
        onClose();
      } else {
        toast.error(response?.message || "Failed to submit update request");
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
          <DialogTitle>Edit Service</DialogTitle>
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

            <div>
  <Label>Category *</Label>

  <Select
    value={formData.category || "default"}
    onValueChange={(value) => handleInputChange("category", value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select category" />
    </SelectTrigger>

    <SelectContent>
      {/* Default disabled option */}
      <SelectItem value="default" disabled>
        Select category
      </SelectItem>

      {categories
        .filter((c) => c.status === "purchased")
        .map((c) => (
          <SelectItem key={c._id} value={c.category._id}>
            {c.category.name}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>

  {categories.length === 0 && (
    <p className="text-sm text-gray-500 mt-1">
      No purchased categories found. Please purchase categories first.
    </p>
  )}
</div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your service..."
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
                  {images.map((img) => (
                    <div key={img.public_id} className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Button clicked for image:', img.public_id);
                          removeImage(img.public_id);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600 transition-colors"
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
