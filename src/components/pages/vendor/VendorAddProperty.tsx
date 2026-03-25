import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import Dropzone from "react-dropzone";
import { createPropertyAPI } from "@/service/operations/property";
import { getPurchasedCategoriesAPI, getAllCategoriesAPI, purchaseCategoryAPI } from "@/service/operations/category";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CloudCog } from "lucide-react";

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
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedCategoryToPurchase, setSelectedCategoryToPurchase] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr">("cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Set vendor ID based on role
  useEffect(() => {
    if (user?.role === "vendor" && user._id) {
      setFormData((prev) => ({ ...prev, vendor: user._id }));
    } else if (user?.role === "admin" && id) {
      setFormData((prev) => ({ ...prev, vendor: id }));
    }
  }, [user, id]);

  // Load purchased categories and all categories
  useEffect(() => {
    const loadCategories = async () => {
      const vendorId = user?.role === "vendor" ? user._id : id;
      if (!vendorId) return;

      const cats = await getPurchasedCategoriesAPI(vendorId);
      console.log("cats",cats);
      setMyCategories(cats);
      
      // Load all categories for purchase option
      const allCats = await getAllCategoriesAPI();
      setAllCategories(allCats);
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

  const openPurchaseModal = (category?: any) => {
    setSelectedCategoryToPurchase(category || null);
    setPaymentMethod("cash");
    setTransactionId("");
    setPurchaseModalOpen(true);
  };

  const handlePurchaseCategory = async () => {
    if (!selectedCategoryToPurchase?._id) return;
    
    const vendorId = user?.role === "vendor" ? user._id : id;
    if (!vendorId) return;

    if (paymentMethod === "qr" && !transactionId.trim()) {
      toast.error("Please enter Transaction ID for QR payment");
      return;
    }

    setPurchaseLoading(true);
    try {
      await purchaseCategoryAPI({
        vendorId: vendorId,
        categoryId: selectedCategoryToPurchase._id,
        paymentMethod,
        transactionId: paymentMethod === "qr" ? transactionId : "",
        assignedByAdmin: user?.role === "admin", // If admin is purchasing, auto-approve
      });
      
      // toast.success("Category purchased successfully!");
      setPurchaseModalOpen(false);
      
      // Reload categories
      const cats = await getPurchasedCategoriesAPI(vendorId);
      setMyCategories(cats);
      
      // Auto-select the purchased category
      setFormData(prev => ({ ...prev, category: selectedCategoryToPurchase._id }));
      
    } catch (error) {
      console.error("Error purchasing category:", error);
      toast.error("Failed to purchase category");
    } finally {
      setPurchaseLoading(false);
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
                      <SelectItem value="on-site-home">On-site & Home Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="category">Category</Label>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      // Show available categories to purchase
                      openPurchaseModal(); // Open modal without pre-selecting category
                    }}
                  >
                    + Purchase Category
                  </Button>
                </div>
                <Select
  value={formData.category}
  onValueChange={(value) =>
    handleSelectChange("category", value)
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>

  <SelectContent>
    {/* Default disabled option */}
    <SelectItem value="default" disabled>
      Select category
    </SelectItem>

    {myCategories
      .filter((c) => c.status === "purchased")
      .map((c) => (
        <SelectItem key={c._id} value={c.category._id}>
          {c.category.name}
        </SelectItem>
      ))}
  </SelectContent>
</Select>
                
                {myCategories.length === 0 ? (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">
                      No categories purchased yet. Choose from available categories:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.slice(0, 5).map((cat) => (
                        <Button
                          key={cat._id}
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => openPurchaseModal(cat)}
                        >
                          {cat.name} - ₹{cat.price}
                        </Button>
                      ))}
                      {allCategories.length > 5 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{allCategories.length - 5} more...
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">
                      Available categories to purchase:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allCategories
                        .filter(cat => !myCategories.some(myCat => myCat._id === cat._id))
                        .slice(0, 5)
                        .map((cat) => (
                          <Button
                            key={cat._id}
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => openPurchaseModal(cat)}
                          >
                            {cat.name} - ₹{cat.price}
                          </Button>
                        ))}
                      {allCategories.filter(cat => !myCategories.some(myCat => myCat._id === cat._id)).length > 5 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{allCategories.filter(cat => !myCategories.some(myCat => myCat._id === cat._id)).length - 5} more...
                        </span>
                      )}
                      {allCategories.filter(cat => !myCategories.some(myCat => myCat._id === cat._id)).length === 0 && (
                        <span className="text-xs text-gray-500">
                          All categories already purchased!
                        </span>
                      )}
                    </div>
                  </div>
                )}
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

      {/* Purchase Category Modal */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Purchase Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Select Category to Purchase</Label>
              <Select
                value={selectedCategoryToPurchase?._id || ""}
                onValueChange={(value) => {
                  const category = allCategories.find(cat => cat._id === value);
                  setSelectedCategoryToPurchase(category || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories
                    .filter(cat => !myCategories.some(myCat => myCat._id === cat._id))
                    .map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name} - ₹{cat.price}
                        {cat.autoFilled && ` (${cat.autoFilled})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategoryToPurchase && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Category Details</h4>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>Name:</strong> {selectedCategoryToPurchase.name}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Price:</strong> ₹{selectedCategoryToPurchase.price}
                </p>
                {selectedCategoryToPurchase.autoFilled && (
                  <p className="text-sm text-blue-700">
                    <strong>Type:</strong> {selectedCategoryToPurchase.autoFilled}
                  </p>
                )}
              </div>
            )}

            {/* Payment Method Selection */}
            {selectedCategoryToPurchase && (
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "cash" ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-50 border-gray-200"}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="sr-only"
                    />
                    <span className="font-medium">💵 Cash</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "qr" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-200"}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="qr"
                      checked={paymentMethod === "qr"}
                      onChange={() => setPaymentMethod("qr")}
                      className="sr-only"
                    />
                    <span className="font-medium">📱 QR</span>
                  </label>
                </div>
              </div>
            )}

            {/* Transaction ID - Only show for QR */}
            {selectedCategoryToPurchase && paymentMethod === "qr" && (
              <div className="space-y-2">
                <Label>Transaction ID <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPurchaseModalOpen(false)}
                disabled={purchaseLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePurchaseCategory}
                disabled={purchaseLoading || !selectedCategoryToPurchase || (paymentMethod === "qr" && !transactionId.trim())}
                className="bg-green-600 hover:bg-green-700"
              >
                {purchaseLoading ? "Purchasing..." : selectedCategoryToPurchase ? `Purchase for ₹${selectedCategoryToPurchase.price}` : "Select Category"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorAddService;
