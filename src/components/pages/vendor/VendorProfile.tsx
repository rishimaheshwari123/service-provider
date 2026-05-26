import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  CreditCard,
  BadgeIcon as IdCard,
  Edit,
  Save,
  X,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
} from "lucide-react";
import {
  getVendorByIdAPI,
  updateVendorProfileAPI,
  requestForTheUpdateProfileAPI,
  uploadVendorProfileImageAPI,
} from "@/service/operations/vendor";
import { createProfileUpdateRequestAPI } from "@/service/operations/vendorProfileUpdateRequest";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

const updateVendorAPI = async (id: string, data: any) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true, vendor: { ...data, _id: id } };
};

interface VendorData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  description: string;
  role: string;
  status: string;
  adhar: string;
  pan: string;
  percentage?: string;
  updateProfileRequest?: string;

  // Additional fields from registration
  typeOfService?: string;
  category?: string;
  subCategory?: string;
  yearOfEstablishment?: string;
  serviceLocation?: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  businessType?: string;
  gstNumber?: string;
  tradeLicense?: string;
  voterId?: string;
  drivingLicence?: string;
  numberOfStaff?: number;
  servicesOffered?: string;
  workingDaysTimings?: string;
  referralCode?: string;
  referralName?: string;

  bankDetail?: {
    accountNumber?: string;
    IFSC?: string;
    accountHolderName?: string;
    branch?: string;
  };
  paymentMethod?: "bank" | "upi";
  upiId?: string;
  experience?: {
    fields?: string[];
    totalYears?: number;
  };
  profilePhoto?: string | File;
  document1?: string | File;
  document2?: string | File;
  document3?: string | File;
  document4?: string | File;
  document5?: string | File;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  autoFilled?: string;
}

const EDIT_STEPS = [
  { id: 1, title: "Basic Info", icon: "📋" },
  { id: 2, title: "Contact", icon: "📞" },
  { id: 3, title: "Business", icon: "🏢" },
  { id: 4, title: "Bank", icon: "🏦" },
  { id: 5, title: "Experience", icon: "⭐" },
  { id: 6, title: "Documents", icon: "📄" },
  { id: 7, title: "Submit", icon: "✅" },
];

const VendorProfile = () => {
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<Partial<VendorData>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAutoFilled, setSelectedAutoFilled] = useState("");
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  });
  const [workingTime, setWorkingTime] = useState("9 AM - 7 PM");
  const [hasWhatsApp, setHasWhatsApp] = useState<boolean | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<
    "aadhaar" | "pan" | "gst" | "tradeLicense" | "voterId" | "drivingLicence" | ""
  >("");
  const [businessDocuments, setBusinessDocuments] = useState<{
    aadhaarFront: File | null;
    aadhaarBack: File | null;
    panCard: File | null;
    gstCertificate: File | null;
    tradeLicenseDoc: File | null;
    voterIdFront: File | null;
    voterIdBack: File | null;
    drivingLicenceFront: File | null;
    drivingLicenceBack: File | null;
  }>({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    gstCertificate: null,
    tradeLicenseDoc: null,
    voterIdFront: null,
    voterIdBack: null,
    drivingLicenceFront: null,
    drivingLicenceBack: null,
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  useEffect(() => {
    fetchVendorData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const data = await getVendorByIdAPI(user?._id);
      console.log("📋 Fetched vendor data:", data);
      console.log("📋 Category data:", data.category);
      console.log("📋 Category type:", typeof data.category);

      setVendor(data);
      setFormData(data);

      // Initialize category selection
      if (data.category) {
        // If category is an object, extract the ID
        const categoryId =
          typeof data.category === "object" ? data.category._id : data.category;
        setSelectedCategory(categoryId);
        console.log("✅ Selected category ID:", categoryId);
      } else {
        console.log("⚠️ No category found in vendor data");
      }
      if (data.subCategory) {
        setSelectedAutoFilled(data.subCategory);
      }

      // Initialize working days if available
      if (data.workingDaysTimings) {
        const workingDaysStr = data.workingDaysTimings;
        const [daysStr, timeStr] = workingDaysStr.split(" | ");
        if (timeStr) {
          setWorkingTime(timeStr);
        }
        if (daysStr) {
          const selectedDays = daysStr.toLowerCase().split(", ");
          const newWorkingDays = {
            monday: selectedDays.some((d: any) => d.includes("mon")),
            tuesday: selectedDays.some((d: any) => d.includes("tue")),
            wednesday: selectedDays.some((d: any) => d.includes("wed")),
            thursday: selectedDays.some((d: any) => d.includes("thu")),
            friday: selectedDays.some((d: any) => d.includes("fri")),
            saturday: selectedDays.some((d: any) => d.includes("sat")),
            sunday: selectedDays.some((d: any) => d.includes("sun")),
          };
          setWorkingDays(newWorkingDays);
        }
      }

      // Initialize WhatsApp selection
      if (data.whatsappNumber) {
        setHasWhatsApp(true);
      } else {
        setHasWhatsApp(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    if (!categoryId || !categories.length) return "-";
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.name || categoryId;
  };

  const handleRequestUpdate = async () => {
    if (!vendor?._id) return;
    const result = await requestForTheUpdateProfileAPI(vendor._id, "requested");

    if (result?.success) {
      setVendor((prev) => ({ ...prev, updateProfileRequest: "requested" }));
    }
  };
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBusinessDocumentChange = (
    docKey: keyof typeof businessDocuments,
    file: File | null,
  ) => {
    setBusinessDocuments((prev) => ({ ...prev, [docKey]: file }));
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!user?._id) return;

    try {
      setUploadingProfileImage(true);
      const response = await uploadVendorProfileImageAPI(user._id, file);

      if (response.success) {
        // Update vendor state with new profile photo
        setVendor((prev) =>
          prev ? { ...prev, profilePhoto: response.profilePhoto } : null,
        );
        toast({
          title: "Success",
          description: "Profile photo updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive",
      });
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);

      // Create form data for file + text fields
      const form = new FormData();

      // Get original category ID for comparison
      const originalCategoryId =
        typeof vendor?.category === "object"
          ? vendor?.category?._id
          : vendor?.category;

      console.log("🔍 Category comparison in handleSave:");
      console.log("  Original category ID:", originalCategoryId);
      console.log("  Selected category ID:", selectedCategory);
      console.log("  FormData category:", formData.category);

      // Add basic text fields (skip special fields that will be added separately)
      const fieldsToSkip = [
        "bankDetail",
        "experience",
        "workingHours",
        "categoryId",
        "category",
        "profilePhoto",
        "document1",
        "document2",
        "document3",
        "document4",
        "document5",
        "paymentMethod",
        "upiId",
        "numberOfStaff",
      ];

      Object.entries(formData).forEach(([key, value]) => {
        if (!fieldsToSkip.includes(key)) {
          if (value !== undefined && value !== null) {
            const stringValue = String(value).trim();
            if (
              stringValue &&
              stringValue.toLowerCase() !== "undefined" &&
              stringValue.toLowerCase() !== "null"
            ) {
              form.append(key, value as string);
            }
          }
        }
      });

      // Only add category if it has actually changed
      if (selectedCategory && selectedCategory !== originalCategoryId) {
        console.log("✅ Category changed, adding to form");
        form.append("category", selectedCategory);
      } else {
        console.log("⏭️  Category unchanged, not adding to form");
      }

      // Add payment method
      if (formData.paymentMethod) {
        form.append("paymentMethod", formData.paymentMethod);
      }

      // Add UPI ID if payment method is UPI
      if (formData.paymentMethod === "upi" && formData.upiId) {
        form.append("upiId", formData.upiId);
      }

      // Add numberOfStaff
      if (formData.numberOfStaff !== undefined) {
        form.append("numberOfStaff", formData.numberOfStaff.toString());
      }

      // Add nested objects
      if (formData.bankDetail && formData.paymentMethod === "bank") {
        Object.entries(formData.bankDetail).forEach(([key, value]) => {
          if (value) form.append(`bankDetail[${key}]`, value);
        });
      }

      if (formData.experience) {
        if (formData.experience.fields?.length) {
          form.append(
            "experience[fields]",
            formData.experience.fields.join(","),
          );
        }
        if (formData.experience.totalYears) {
          form.append(
            "experience[totalYears]",
            formData.experience.totalYears.toString(),
          );
        }
      }

      // Add profile photo if new file selected
      if (profilePhoto instanceof File) {
        form.append("profilePhoto", profilePhoto);
      }

      // Add business documents in backend format (document1, document2, etc.)
      form.append("selectedDocumentType", selectedDocumentType);

      if (selectedDocumentType === "aadhaar") {
        if (businessDocuments.aadhaarFront instanceof File) {
          form.append("document1", businessDocuments.aadhaarFront);
        }
        if (businessDocuments.aadhaarBack instanceof File) {
          form.append("document2", businessDocuments.aadhaarBack);
        }
      } else if (selectedDocumentType === "pan") {
        if (businessDocuments.panCard instanceof File) {
          form.append("document1", businessDocuments.panCard);
        }
      } else if (selectedDocumentType === "gst") {
        if (businessDocuments.gstCertificate instanceof File) {
          form.append("document1", businessDocuments.gstCertificate);
        }
      } else if (selectedDocumentType === "tradeLicense") {
        if (businessDocuments.tradeLicenseDoc instanceof File) {
          form.append("document1", businessDocuments.tradeLicenseDoc);
        }
      } else if (selectedDocumentType === "voterId") {
        if (businessDocuments.voterIdFront instanceof File) {
          form.append("document1", businessDocuments.voterIdFront);
        }
        if (businessDocuments.voterIdBack instanceof File) {
          form.append("document2", businessDocuments.voterIdBack);
        }
      } else if (selectedDocumentType === "drivingLicence") {
        if (businessDocuments.drivingLicenceFront instanceof File) {
          form.append("document1", businessDocuments.drivingLicenceFront);
        }
        if (businessDocuments.drivingLicenceBack instanceof File) {
          form.append("document2", businessDocuments.drivingLicenceBack);
        }
      }

      // Use new API to create profile update request
      const response = await createProfileUpdateRequestAPI(user?._id, form);

      if (response.success) {
        setVendor((prev) => ({ ...prev, updateProfileRequest: "requested" }));
        setIsEditing(false);
        setCurrentStep(1); // Reset to first step
        toast({
          title: "Success",
          description:
            "Your profile changes have been submitted for admin approval",
        });
      }
    } catch (error: unknown) {
      const backendMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (
          error as {
            response?: { data?: { message?: string; error?: string } };
          }
        ).response?.data
          ? (
              error as {
                response?: { data?: { message?: string; error?: string } };
              }
            ).response?.data?.message ||
            (
              error as {
                response?: { data?: { message?: string; error?: string } };
              }
            ).response?.data?.error
          : null;
      toast({
        title: "Error",
        description: backendMessage || "Failed to submit profile changes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData(vendor || {});
    setIsEditing(false);
    setCurrentStep(1); // Reset to first step

    // Reset category selections
    if (vendor?.category) {
      setSelectedCategory(
        vendor.categoryId || vendor.category?._id || vendor.category,
      );
    }
    if (vendor?.subCategory) {
      setSelectedAutoFilled(vendor.subCategory);
    }

    // Reset WhatsApp selection
    if (vendor?.whatsappNumber) {
      setHasWhatsApp(true);
    } else {
      setHasWhatsApp(false);
    }

    // Reset documents
    setSelectedDocumentType("");
    setProfilePhoto(null);
    setBusinessDocuments({
      aadhaarFront: null,
      aadhaarBack: null,
      panCard: null,
      gstCertificate: null,
      tradeLicenseDoc: null,
      voterIdFront: null,
      voterIdBack: null,
      drivingLicenceFront: null,
      drivingLicenceBack: null,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const progress = (currentStep / 7) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-0  lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Partner Profile
              </h1>

              <p className="text-sm md:text-base text-gray-600 mt-1">
                Manage your profile information
              </p>
            </div>

            <div className="w-full md:w-auto">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    onClick={handleSave}
                    disabled={updating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updating
                      ? "Submitting for Approval..."
                      : "Submit for Approval"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          // Edit Mode with Steps
          <div>
            {/* Progress Bar */}
            <div className="mb-8">
              <Progress value={progress} className="h-2 mb-4" />
              <div className="flex justify-between overflow-x-auto pb-2">
                {EDIT_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center min-w-[80px] cursor-pointer ${
                      currentStep >= step.id
                        ? "text-yellow-600"
                        : "text-gray-400"
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 ${
                        currentStep > step.id
                          ? "bg-green-500 text-white"
                          : currentStep === step.id
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200"
                      }`}
                    >
                      {currentStep > step.id ? <Check size={20} /> : step.icon}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="text-xl">
                  Step {currentStep}: {EDIT_STEPS[currentStep - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Service Provider / Business Name</Label>
                        <Input
                          value={formData.company || ""}
                          onChange={(e) =>
                            handleInputChange("company", e.target.value)
                          }
                          placeholder="Enter business name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type of Service</Label>
                        <Input
                          value={formData.typeOfService || ""}
                          onChange={(e) =>
                            handleInputChange("typeOfService", e.target.value)
                          }
                          placeholder="e.g., Plumbing, Electrical"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Service Description</Label>
                      <Textarea
                        value={formData.description || ""}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe your services in detail"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category (Service)</Label>
                        <Select
                          disabled
                          value={selectedCategory}
                          onValueChange={(val) => {
                            setSelectedCategory(val);
                            handleInputChange("category", val);
                            const selectedCat = categories.find(
                              (c) => c._id === val,
                            );
                            if (selectedCat?.autoFilled) {
                              setSelectedAutoFilled(selectedCat.autoFilled);
                              handleInputChange(
                                "subCategory",
                                selectedCat.autoFilled,
                              );
                            } else {
                              setSelectedAutoFilled("");
                              handleInputChange("subCategory", "");
                            }
                          }}
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
                      </div>
                      <div className="space-y-2">
                        <Label>Sub Category (Auto Filled)</Label>
                        <Input
                          disabled
                          placeholder="Auto-filled based on category"
                          value={selectedAutoFilled}
                          onChange={(e) => {
                            setSelectedAutoFilled(e.target.value);
                            handleInputChange("subCategory", e.target.value);
                          }}
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Year of Establishment</Label>
                        <Input
                          value={formData.yearOfEstablishment || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "yearOfEstablishment",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 2020"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Owner / Authorized Person Name</Label>
                        <Input
                          value={formData.name || ""}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Enter owner name"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Registered Office / Home Address</Label>
                      <Textarea
                        value={formData.address || ""}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder="Enter complete address"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Service Location / Area Covered</Label>
                      <LocationAutocomplete
                        value={formData.serviceLocation || ""}
                        onChange={(value) =>
                          handleInputChange("serviceLocation", value)
                        }
                        placeholder="Search location (e.g., Sagar, Bhopal, All MP)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Contact Number</Label>
                        <Input
                          value={formData.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="10-digit number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Alternate Contact Number</Label>
                        <Input
                          value={formData.alternatePhone || ""}
                          onChange={(e) =>
                            handleInputChange("alternatePhone", e.target.value)
                          }
                          placeholder="10-digit number (optional)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Do you have WhatsApp?{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={
                            hasWhatsApp === null
                              ? ""
                              : hasWhatsApp
                                ? "yes"
                                : "no"
                          }
                          onValueChange={(val) => {
                            const hasWA = val === "yes";
                            setHasWhatsApp(hasWA);
                            if (!hasWA) {
                              handleInputChange("whatsappNumber", "");
                            }
                          }}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="whatsapp-yes" />
                            <Label
                              htmlFor="whatsapp-yes"
                              className="cursor-pointer"
                            >
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="whatsapp-no" />
                            <Label
                              htmlFor="whatsapp-no"
                              className="cursor-pointer"
                            >
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {hasWhatsApp && (
                        <div className="space-y-2">
                          <Label>
                            WhatsApp Number{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={formData.whatsappNumber || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "whatsappNumber",
                                e.target.value,
                              )
                            }
                            placeholder="10-digit WhatsApp number"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email ID</Label>
                      <Input
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        type="email"
                        placeholder="email@example.com (optional)"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Business & Legal */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Business Type</Label>
                      <RadioGroup
                        value={formData.businessType || "Proprietorship"}
                        onValueChange={(val) =>
                          handleInputChange("businessType", val)
                        }
                        className="grid grid-cols-2 md:grid-cols-3 gap-3"
                      >
                        {[
                          "Proprietorship",
                          "Partnership",
                          "LLP",
                          "Private Limited",
                          "Other",
                        ].map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50"
                          >
                            <RadioGroupItem
                              value={type}
                              id={`vendor-${type}`}
                            />
                            <Label
                              htmlFor={`vendor-${type}`}
                              className="cursor-pointer"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Document Upload Section */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 mt-1">📄</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1">
                            Business Document Upload
                          </h4>
                          <p className="text-sm text-blue-700">
                            Select document type and upload files. Leave empty
                            to keep existing documents.
                          </p>
                        </div>
                      </div>

                      {/* Document Type Selection */}
                      <div className="space-y-2">
                        <Label>Select Document Type (Optional)</Label>
                        <Select
                          value={selectedDocumentType}
                          onValueChange={(val: any) =>
                            setSelectedDocumentType(val)
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Choose document to upload" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aadhaar">
                              Aadhaar Card (Front & Back)
                            </SelectItem>
                            <SelectItem value="pan">PAN Card</SelectItem>
                            <SelectItem value="gst">GST Certificate</SelectItem>
                            <SelectItem value="tradeLicense">
                              Trade License
                            </SelectItem>
                            <SelectItem value="voterId">
                              Voter ID Card (Front & Back)
                            </SelectItem>
                            <SelectItem value="drivingLicence">
                              Driving Licence (Front & Back)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Conditional File Upload based on Document Type */}
                      {selectedDocumentType === "aadhaar" && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                            📸 Upload both front and back images of Aadhaar card
                          </p>

                          {/* Aadhaar Number Input */}
                          <div className="space-y-2">
                            <Label>Aadhaar Number</Label>
                            <Input
                              value={formData.adhar || ""}
                              onChange={(e) =>
                                handleInputChange("adhar", e.target.value)
                              }
                              placeholder="12-digit Aadhaar number"
                            />
                          </div>

                          {/* Aadhaar Front */}
                          <div className="space-y-2">
                            <Label>Aadhaar Card - Front Side</Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div
                                  className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                    !businessDocuments.aadhaarFront
                                      ? "border-gray-300 bg-white"
                                      : "border-green-500 bg-green-50"
                                  }`}
                                >
                                  {businessDocuments.aadhaarFront ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">
                                        {businessDocuments.aadhaarFront.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload Aadhaar Front</span>
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleBusinessDocumentChange(
                                      "aadhaarFront",
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                />
                              </label>
                              {businessDocuments.aadhaarFront && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleBusinessDocumentChange(
                                      "aadhaarFront",
                                      null,
                                    )
                                  }
                                >
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Aadhaar Back */}
                          <div className="space-y-2">
                            <Label>Aadhaar Card - Back Side</Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div
                                  className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                    !businessDocuments.aadhaarBack
                                      ? "border-gray-300 bg-white"
                                      : "border-green-500 bg-green-50"
                                  }`}
                                >
                                  {businessDocuments.aadhaarBack ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">
                                        {businessDocuments.aadhaarBack.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload Aadhaar Back</span>
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleBusinessDocumentChange(
                                      "aadhaarBack",
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                />
                              </label>
                              {businessDocuments.aadhaarBack && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleBusinessDocumentChange(
                                      "aadhaarBack",
                                      null,
                                    )
                                  }
                                >
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedDocumentType === "pan" && (
                        <div className="space-y-2">
                          {/* PAN Number Input */}
                          <div className="space-y-2">
                            <Label>PAN Number</Label>
                            <Input
                              value={formData.pan || ""}
                              onChange={(e) =>
                                handleInputChange("pan", e.target.value)
                              }
                              placeholder="ABCDE1234F"
                              className="uppercase"
                            />
                          </div>

                          {/* PAN Card Upload */}
                          <Label>PAN Card</Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div
                                className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                  !businessDocuments.panCard
                                    ? "border-gray-300 bg-white"
                                    : "border-green-500 bg-green-50"
                                }`}
                              >
                                {businessDocuments.panCard ? (
                                  <div className="flex items-center justify-center gap-2 text-green-600">
                                    <Check size={20} />
                                    <span className="truncate max-w-[200px]">
                                      {businessDocuments.panCard.name}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2 text-gray-500">
                                    <Upload size={20} />
                                    <span>Upload PAN Card</span>
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  handleBusinessDocumentChange(
                                    "panCard",
                                    e.target.files?.[0] || null,
                                  )
                                }
                              />
                            </label>
                            {businessDocuments.panCard && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleBusinessDocumentChange("panCard", null)
                                }
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedDocumentType === "gst" && (
                        <div className="space-y-2">
                          {/* GST Number Input */}
                          <div className="space-y-2">
                            <Label>GST Number</Label>
                            <Input
                              value={formData.gstNumber || ""}
                              onChange={(e) =>
                                handleInputChange("gstNumber", e.target.value)
                              }
                              placeholder="Enter GST number"
                            />
                          </div>

                          {/* GST Certificate Upload */}
                          <Label>GST Certificate</Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div
                                className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                  !businessDocuments.gstCertificate
                                    ? "border-gray-300 bg-white"
                                    : "border-green-500 bg-green-50"
                                }`}
                              >
                                {businessDocuments.gstCertificate ? (
                                  <div className="flex items-center justify-center gap-2 text-green-600">
                                    <Check size={20} />
                                    <span className="truncate max-w-[200px]">
                                      {businessDocuments.gstCertificate.name}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2 text-gray-500">
                                    <Upload size={20} />
                                    <span>Upload GST Certificate</span>
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  handleBusinessDocumentChange(
                                    "gstCertificate",
                                    e.target.files?.[0] || null,
                                  )
                                }
                              />
                            </label>
                            {businessDocuments.gstCertificate && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleBusinessDocumentChange(
                                    "gstCertificate",
                                    null,
                                  )
                                }
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedDocumentType === "tradeLicense" && (
                        <div className="space-y-2">
                          {/* Trade License Number Input */}
                          <div className="space-y-2">
                            <Label>
                              Trade License / Shop Act Registration No.
                            </Label>
                            <Input
                              value={formData.tradeLicense || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "tradeLicense",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter license number"
                            />
                          </div>

                          {/* Trade License Upload */}
                          <Label>Trade License</Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div
                                className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                  !businessDocuments.tradeLicenseDoc
                                    ? "border-gray-300 bg-white"
                                    : "border-green-500 bg-green-50"
                                }`}
                              >
                                {businessDocuments.tradeLicenseDoc ? (
                                  <div className="flex items-center justify-center gap-2 text-green-600">
                                    <Check size={20} />
                                    <span className="truncate max-w-[200px]">
                                      {businessDocuments.tradeLicenseDoc.name}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2 text-gray-500">
                                    <Upload size={20} />
                                    <span>Upload Trade License</span>
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  handleBusinessDocumentChange(
                                    "tradeLicenseDoc",
                                    e.target.files?.[0] || null,
                                  )
                                }
                              />
                            </label>
                            {businessDocuments.tradeLicenseDoc && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleBusinessDocumentChange(
                                    "tradeLicenseDoc",
                                    null,
                                  )
                                }
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                        {selectedDocumentType === "voterId" && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                            📸 Upload both front and back images of Voter ID card
                          </p>

                          {/* Voter ID Number Input */}
                          <div className="space-y-2">
                            <Label>Voter ID Number</Label>
                            <Input
                              value={formData.voterId || ""}
                              onChange={(e) =>
                                handleInputChange("voterId", e.target.value.toUpperCase())
                              }
                              placeholder="Enter Voter ID number"
                            />
                          </div>

                          {/* Voter ID Front */}
                          <div className="space-y-2">
                            <Label>Voter ID Card - Front Side</Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div
                                  className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                    !businessDocuments.voterIdFront
                                      ? "border-gray-300 bg-white"
                                      : "border-green-500 bg-green-50"
                                  }`}
                                >
                                  {businessDocuments.voterIdFront ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">
                                        {businessDocuments.voterIdFront.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload Voter ID Front</span>
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleBusinessDocumentChange(
                                      "voterIdFront",
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                />
                              </label>
                              {businessDocuments.voterIdFront && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleBusinessDocumentChange(
                                      "voterIdFront",
                                      null,
                                    )
                                  }
                                >
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Voter ID Back */}
                          <div className="space-y-2">
                            <Label>Voter ID Card - Back Side</Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div
                                  className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                    !businessDocuments.voterIdBack
                                      ? "border-gray-300 bg-white"
                                      : "border-green-500 bg-green-50"
                                  }`}
                                >
                                  {businessDocuments.voterIdBack ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">
                                        {businessDocuments.voterIdBack.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload Voter ID Back</span>
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleBusinessDocumentChange(
                                      "voterIdBack",
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                />
                              </label>
                              {businessDocuments.voterIdBack && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleBusinessDocumentChange(
                                      "voterIdBack",
                                      null,
                                    )
                                  }
                                >
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedDocumentType === "drivingLicence" && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                            📸 Upload both front and back images of Driving Licence
                          </p>

                          {/* Driving Licence Number Input */}
                          <div className="space-y-2">
                            <Label>Driving Licence Number</Label>
                            <Input
                              value={formData.drivingLicence || ""}
                              onChange={(e) =>
                                handleInputChange("drivingLicence", e.target.value.toUpperCase())
                              }
                              placeholder="Enter Driving Licence number"
                            />
                          </div>

                          {/* Driving Licence Front */}
                          <div className="space-y-2">
                            <Label>Driving Licence - Front Side</Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div
                                  className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                    !businessDocuments.drivingLicenceFront
                                      ? "border-gray-300 bg-white"
                                      : "border-green-500 bg-green-50"
                                  }`}
                                >
                                  {businessDocuments.drivingLicenceFront ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">
                                        {businessDocuments.drivingLicenceFront.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload DL Front</span>
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleBusinessDocumentChange(
                                      "drivingLicenceFront",
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                />
                              </label>
                              {businessDocuments.drivingLicenceFront && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleBusinessDocumentChange(
                                      "drivingLicenceFront",
                                      null,
                                    )
                                  }
                                >
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Driving Licence Back */}
                          <div className="space-y-2">
                            <Label>Driving Licence - Back Side</Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div
                                  className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                    !businessDocuments.drivingLicenceBack
                                      ? "border-gray-300 bg-white"
                                      : "border-green-500 bg-green-50"
                                  }`}
                                >
                                  {businessDocuments.drivingLicenceBack ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">
                                        {businessDocuments.drivingLicenceBack.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload DL Back</span>
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleBusinessDocumentChange(
                                      "drivingLicenceBack",
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                />
                              </label>
                              {businessDocuments.drivingLicenceBack && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleBusinessDocumentChange(
                                      "drivingLicenceBack",
                                      null,
                                    )
                                  }
                                >
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {!selectedDocumentType && (
                        <div className="text-center py-6 text-gray-400">
                          <p className="text-sm">
                            Select a document type to upload new documents
                          </p>
                          <p className="text-xs mt-1">
                            Leave empty to keep existing documents
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Bank Details */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <Label>Select Payment Method</Label>
                      <RadioGroup
                        value={formData.paymentMethod || "bank"}
                        onValueChange={(val: "bank" | "upi") => {
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod: val,
                          }));
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 flex-1">
                          <RadioGroupItem
                            value="bank"
                            id="vendor-payment-bank"
                          />
                          <Label
                            htmlFor="vendor-payment-bank"
                            className="cursor-pointer flex-1"
                          >
                            <div className="font-semibold">Bank Account</div>
                            <div className="text-xs text-gray-500">
                              Bank details
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 flex-1">
                          <RadioGroupItem value="upi" id="vendor-payment-upi" />
                          <Label
                            htmlFor="vendor-payment-upi"
                            className="cursor-pointer flex-1"
                          >
                            <div className="font-semibold">UPI ID</div>
                            <div className="text-xs text-gray-500">
                              UPI payment
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Bank Details Fields */}
                    {(formData.paymentMethod || "bank") === "bank" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                              value={formData.bankDetail?.branch || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  bankDetail: {
                                    ...prev.bankDetail,
                                    branch: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Enter bank name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Account Holder Name</Label>
                            <Input
                              value={
                                formData.bankDetail?.accountHolderName || ""
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  bankDetail: {
                                    ...prev.bankDetail,
                                    accountHolderName: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Name as per bank account"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                              value={formData.bankDetail?.accountNumber || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  bankDetail: {
                                    ...prev.bankDetail,
                                    accountNumber: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Enter account number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>IFSC Code</Label>
                            <Input
                              value={formData.bankDetail?.IFSC || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  bankDetail: {
                                    ...prev.bankDetail,
                                    IFSC: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Enter IFSC code"
                              className="uppercase"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* UPI ID Field */}
                    {formData.paymentMethod === "upi" && (
                      <div className="space-y-2">
                        <Label>UPI ID</Label>
                        <Input
                          value={formData.upiId || ""}
                          onChange={(e) =>
                            handleInputChange("upiId", e.target.value)
                          }
                          placeholder="Enter UPI ID (e.g., yourname@paytm, 9876543210@ybl)"
                        />
                        <p className="text-xs text-gray-500">
                          💡 Enter UPI ID from any UPI app (PhonePe, Google Pay,
                          Paytm, etc.)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Experience */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                          value={formData.experience?.totalYears || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              experience: {
                                ...prev.experience,
                                totalYears: Number(e.target.value),
                              },
                            }))
                          }
                          type="number"
                          placeholder="e.g., 5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Number of Technicians / Staff</Label>
                        <Input
                          value={formData.numberOfStaff || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "numberOfStaff",
                              Number(e.target.value),
                            )
                          }
                          type="number"
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Services Offered (comma separated)</Label>
                      <Textarea
                        value={(formData.experience?.fields || []).join(", ")}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            experience: {
                              ...prev.experience,
                              fields: e.target.value
                                .split(",")
                                .map((f) => f.trim()),
                            },
                          }))
                        }
                        placeholder="e.g., AC Repair, AC Installation, AC Service"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Working Days</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {[
                          { key: "monday", label: "Mon" },
                          { key: "tuesday", label: "Tue" },
                          { key: "wednesday", label: "Wed" },
                          { key: "thursday", label: "Thu" },
                          { key: "friday", label: "Fri" },
                          { key: "saturday", label: "Sat" },
                          { key: "sunday", label: "Sun" },
                        ].map((day) => (
                          <label
                            key={day.key}
                            className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                              workingDays[day.key as keyof typeof workingDays]
                                ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                                : "bg-gray-50 border-gray-200 text-gray-500"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={
                                workingDays[day.key as keyof typeof workingDays]
                              }
                              onChange={(e) => {
                                const newDays = {
                                  ...workingDays,
                                  [day.key]: e.target.checked,
                                };
                                setWorkingDays(newDays);
                                const selectedDays = Object.entries(newDays)
                                  .filter(([, v]) => v)
                                  .map(
                                    ([k]) =>
                                      k.charAt(0).toUpperCase() + k.slice(1, 3),
                                  );
                                handleInputChange(
                                  "workingDays",
                                  `${selectedDays.join(", ")} | ${workingTime}`,
                                );
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">
                              {day.label}
                            </span>
                            {workingDays[
                              day.key as keyof typeof workingDays
                            ] && (
                              <Check size={14} className="text-yellow-600" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Working Timings</Label>
                      <Input
                        value={workingTime}
                        onChange={(e) => {
                          setWorkingTime(e.target.value);
                          const selectedDays = Object.entries(workingDays)
                            .filter(([, v]) => v)
                            .map(
                              ([k]) =>
                                k.charAt(0).toUpperCase() + k.slice(1, 3),
                            );
                          handleInputChange(
                            "workingDays",
                            `${selectedDays.join(", ")} | ${e.target.value}`,
                          );
                        }}
                        placeholder="e.g., 9 AM - 7 PM"
                      />
                    </div>
                  </div>
                )}

                {/* Step 6: Documents */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                      📸 Upload or update profile photo. Business documents can
                      be updated in Step 3.
                    </p>

                    {/* Profile Photo Section */}
                    <div className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <Label className="text-yellow-800 font-semibold">
                        Profile Photo
                      </Label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center hover:border-yellow-500 transition-colors bg-white">
                            {profilePhoto ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400">
                                  <img
                                    src={URL.createObjectURL(profilePhoto)}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                  <Check size={20} />
                                  <span className="truncate max-w-[200px] font-medium">
                                    {profilePhoto.name}
                                  </span>
                                </div>
                              </div>
                            ) : vendor?.profilePhoto &&
                              typeof vendor.profilePhoto === "string" ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400">
                                  <img
                                    src={vendor.profilePhoto}
                                    alt="Current Profile"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex items-center gap-2 text-blue-600">
                                  <FileText size={20} />
                                  <span className="font-medium">
                                    Current photo
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-yellow-600">
                                <div className="w-32 h-32 rounded-full bg-yellow-100 flex items-center justify-center border-4 border-yellow-300">
                                  <Upload size={40} />
                                </div>
                                <span className="font-medium">
                                  Click to upload profile photo
                                </span>
                                <span className="text-sm text-gray-500">
                                  JPG, PNG or JPEG (Max 5MB)
                                </span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              setProfilePhoto(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        {profilePhoto && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setProfilePhoto(null)}
                            className="self-start"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 text-center mt-2">
                        💡 A professional photo helps build trust with customers
                      </p>
                    </div>

                    {/* Info about business documents */}
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700 font-medium">
                            Business Documents
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            To update business documents (Aadhaar, PAN, GST,
                            Trade License), go back to Step 3 - Business
                            section.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Submit */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Referral Code</Label>
                        <Input
                          value={formData.referralCode || ""}
                          onChange={(e) =>
                            handleInputChange("referralCode", e.target.value)
                          }
                          placeholder="Enter referral code if any"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Referral Name</Label>
                        <Input
                          value={formData.referralName || ""}
                          onChange={(e) =>
                            handleInputChange("referralName", e.target.value)
                          }
                          placeholder="Enter referral name if any"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Admin Commission (%)</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {vendor?.percentage
                          ? `${vendor.percentage}%`
                          : "Not set"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <h4 className="font-semibold text-gray-800">
                        Profile Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>
                            <strong>Business:</strong> {formData.company}
                          </p>
                          <p>
                            <strong>Owner:</strong> {formData.name}
                          </p>
                          <p>
                            <strong>Phone:</strong> {formData.phone}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {formData.email || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Business Type:</strong>{" "}
                            {formData.businessType}
                          </p>
                          <p>
                            <strong>Experience:</strong>{" "}
                            {formData.experience?.totalYears || 0} years
                          </p>
                          <p>
                            <strong>Staff:</strong>{" "}
                            {formData.numberOfStaff || 0}
                          </p>
                          <p>
                            <strong>Status:</strong> {vendor.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft size={18} /> Previous
                  </Button>

                  {currentStep < 7 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      Next <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={updating}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {updating ? "Saving..." : "Save All Changes"}{" "}
                      <Save size={18} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // View Mode - Complete Profile Display with All Details
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="w-24 h-24 mx-auto mb-4">
                        {vendor.profilePhoto &&
                        typeof vendor.profilePhoto === "string" ? (
                          <AvatarImage
                            src={vendor.profilePhoto}
                            alt={vendor.name}
                          />
                        ) : (
                          <AvatarFallback className="text-2xl">
                            {getInitials(vendor.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      {/* Profile Image Upload Button */}
                      <label className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleProfileImageUpload(file);
                            }
                          }}
                          disabled={uploadingProfileImage}
                        />
                      </label>

                      {uploadingProfileImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900">
                      {vendor.name}
                    </h2>
                    <p className="text-gray-600">{vendor.company}</p>

                    {/* Alternative Profile Image Upload Button */}
                    <div className="mt-3 mb-3">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer transition-colors text-sm">
                        <Upload className="w-4 h-4" />
                        {uploadingProfileImage
                          ? "Uploading..."
                          : "Change Photo"}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleProfileImageUpload(file);
                            }
                          }}
                          disabled={uploadingProfileImage}
                        />
                      </label>
                    </div>

                    <div className="flex justify-center mt-3">
                      <Badge
                        variant={
                          vendor.status === "active" ? "default" : "secondary"
                        }
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {vendor.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Member since</p>
                        <p className="font-medium">
                          {formatDate(vendor.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Role</p>
                        <p className="font-medium capitalize">{vendor.role}</p>
                      </div>
                    </div>
                    {vendor.yearOfEstablishment && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Established</p>
                          <p className="font-medium">
                            {vendor.yearOfEstablishment}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Service Provider / Business Name</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        {vendor.company}
                      </p>
                    </div>
                    <div>
                      <Label>Type of Service</Label>
                      <p className="mt-1 text-gray-900">
                        {vendor.typeOfService || "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Owner / Authorized Person</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {vendor.name}
                      </p>
                    </div>
                    <div>
                      <Label>Year of Establishment</Label>
                      <p className="mt-1 text-gray-900">
                        {vendor.yearOfEstablishment || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <p className="mt-1 text-gray-900">
                        {vendor.category?.name || vendor.category || "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Sub Category</Label>
                      <p className="mt-1 text-gray-900">
                        {vendor.subCategory || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Service Description</Label>
                    <p className="mt-1 text-gray-900 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      {vendor.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Registered Office / Home Address</Label>
                    <p className="mt-1 text-gray-900 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      {vendor.address}
                    </p>
                  </div>
                  <div>
                    <Label>Service Location / Area Covered</Label>
                    <p className="mt-1 text-gray-900 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      {vendor.serviceLocation || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Contact Number</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {vendor.phone}
                      </p>
                    </div>
                    <div>
                      <Label>Alternate Contact Number</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {vendor.alternatePhone || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>WhatsApp Number</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {vendor.whatsappNumber || "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {vendor.email || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business & Legal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business & Legal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Type</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        {vendor.businessType || "Proprietorship"}
                      </p>
                    </div>
                    <div>
                      <Label>GST Number</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {vendor.gstNumber || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Aadhaar Number</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-gray-400" />
                        {vendor.adhar || "-"}
                      </p>
                    </div>
                    <div>
                      <Label>PAN Number</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {vendor.pan || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Voter ID</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-gray-400" />
                        {vendor.voterId || "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Driving Licence</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {vendor.drivingLicence || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Trade License / Shop Act Registration No.</Label>
                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {vendor.tradeLicense || "-"}
                    </p>
                  </div>
                  <div>
                    <Label>Admin Commission (%)</Label>
                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      {vendor?.percentage ? `${vendor.percentage}%` : "Not set"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Method */}
                  <div>
                    <Label>Payment Method</Label>
                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">
                        {vendor.paymentMethod || "Bank"}
                      </span>
                    </p>
                  </div>

                  {/* Bank Details */}
                  {(!vendor.paymentMethod ||
                    vendor.paymentMethod === "bank") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Bank Name</Label>
                          <p className="mt-1 text-gray-900 flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            {vendor.bankDetail?.branch || "-"}
                          </p>
                        </div>
                        <div>
                          <Label>Account Holder Name</Label>
                          <p className="mt-1 text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {vendor.bankDetail?.accountHolderName || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Account Number</Label>
                          <p className="mt-1 text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            {vendor.bankDetail?.accountNumber || "-"}
                          </p>
                        </div>
                        <div>
                          <Label>IFSC Code</Label>
                          <p className="mt-1 text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            {vendor.bankDetail?.IFSC || "-"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* UPI Details */}
                  {vendor.paymentMethod === "upi" && (
                    <div>
                      <Label>UPI ID</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {vendor.upiId || "-"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Experience & Staff Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Experience & Staff Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Years of Experience</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {vendor.experience?.totalYears || 0} years
                      </p>
                    </div>
                    <div>
                      <Label>Number of Staff</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {vendor.numberOfStaff || 0}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Services Offered</Label>
                    <p className="mt-1 text-gray-900 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      {(vendor.experience?.fields || []).join(", ") || "-"}
                    </p>
                  </div>
                  <div>
                    <Label>Working Days & Timings</Label>
                    <p className="mt-1 text-gray-900 flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      {vendor.workingDaysTimings || "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Profile Photo</Label>
                      {vendor.profilePhoto &&
                      typeof vendor.profilePhoto === "string" ? (
                        <a
                          href={vendor.profilePhoto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mt-1 block flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Profile Photo
                        </a>
                      ) : (
                        <p className="mt-1 text-gray-900">-</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num}>
                        <Label>Document {num}</Label>
                        {vendor[`document${num}` as keyof VendorData] &&
                        typeof vendor[`document${num}` as keyof VendorData] ===
                          "string" ? (
                          <a
                            href={
                              vendor[
                                `document${num}` as keyof VendorData
                              ] as string
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline mt-1 block flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Document {num}
                          </a>
                        ) : (
                          <p className="mt-1 text-gray-900">-</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Referral Information */}
              {(vendor.referralCode || vendor.referralName) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Referral Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Referral Code</Label>
                        <p className="mt-1 text-gray-900">
                          {vendor.referralCode || "-"}
                        </p>
                      </div>
                      <div>
                        <Label>Referral Name</Label>
                        <p className="mt-1 text-gray-900">
                          {vendor.referralName || "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProfile;
