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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/service/operations/vendor";
import { getAllCategoriesAPI } from "@/service/operations/category";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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

const VendorProfileMangeByAdmin = ({ user }) => {
  console.log(user);
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
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    document1: null,
    document2: null,
    document3: null,
    document4: null,
    document5: null,
  });

  useEffect(() => {
    fetchVendorData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const data = await getVendorByIdAPI(user?._id);
      console.log("📋 Fetched vendor data (Admin):", data);
      console.log("📋 Category data:", data.category);
      console.log("📋 Category type:", typeof data.category);
      
      setVendor(data);
      setFormData(data);
      
      // Initialize category selection - handle both object and string
      if (data.category) {
        // If category is an object, extract the ID
        const categoryId = typeof data.category === 'object' ? data.category._id : data.category;
        setSelectedCategory(categoryId);
        console.log("✅ Selected category ID (Admin):", categoryId);
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
            monday: selectedDays.some(d => d.includes("mon")),
            tuesday: selectedDays.some(d => d.includes("tue")),
            wednesday: selectedDays.some(d => d.includes("wed")),
            thursday: selectedDays.some(d => d.includes("thu")),
            friday: selectedDays.some(d => d.includes("fri")),
            saturday: selectedDays.some(d => d.includes("sat")),
            sunday: selectedDays.some(d => d.includes("sun")),
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

  const handleRequestUpdate = async () => {
    if (!vendor?._id) return;
    
    try {
      const result = await requestForTheUpdateProfileAPI(vendor._id, "requested");

      if (result?.success) {
        setVendor((prev) => ({ ...prev, updateProfileRequest: "requested" }));
        toast({
          title: "Success",
          description: "Profile update request submitted successfully. Admin will review your request.",
        });
      } else {
        throw new Error(result?.message || "Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit profile update request",
        variant: "destructive",
      });
    }
  };
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (docKey: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [docKey]: file }));
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

      // Add basic text fields (exclude workingHours and other special fields)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "bankDetail" &&
          key !== "experience" &&
          key !== "workingHours" && // Exclude workingHours from general update
          key !== "profilePhoto" &&
          key !== "document1" &&
          key !== "document2" &&
          key !== "document3" &&
          key !== "document4" &&
          key !== "document5"
        ) {
          if (value !== undefined && value !== null) {
            form.append(key, value as string);
          }
        }
      });

      // Add nested objects
      if (formData.bankDetail) {
        Object.entries(formData.bankDetail).forEach(([key, value]) => {
          if (value) form.append(`bankDetail[${key}]`, value);
        });
      }

      if (formData.experience) {
        if (formData.experience.fields?.length) {
          form.append(
            "experience[fields]",
            formData.experience.fields.join(",")
          );
        }
        if (formData.experience.totalYears) {
          form.append(
            "experience[totalYears]",
            formData.experience.totalYears.toString()
          );
        }
      }

      // Add files only if new files selected
      if (documents.profilePhoto instanceof File) {
        form.append("profilePhoto", documents.profilePhoto);
      }
      if (documents.document1 instanceof File) {
        form.append("document1", documents.document1);
      }
      if (documents.document2 instanceof File) {
        form.append("document2", documents.document2);
      }
      if (documents.document3 instanceof File) {
        form.append("document3", documents.document3);
      }
      if (documents.document4 instanceof File) {
        form.append("document4", documents.document4);
      }
      if (documents.document5 instanceof File) {
        form.append("document5", documents.document5);
      }

      const response = await updateVendorProfileAPI(user?._id, form);

      if (response.success) {
        setVendor((prev) => ({ ...prev, ...formData } as VendorData));
        setIsEditing(false);
        setCurrentStep(1); // Reset to first step
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
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
      setSelectedCategory(vendor.categoryId || vendor.category?._id || vendor.category);
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
    setDocuments({
      document1: null,
      document2: null,
      document3: null,
      document4: null,
      document5: null,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Partner Profile Management
              </h1>
              <p className="text-gray-600 mt-1">
                Edit vendor profile information
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updating}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updating ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updating}
                    className="flex items-center gap-2"
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
                      currentStep >= step.id ? "text-yellow-600" : "text-gray-400"
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
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
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
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="Enter business name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type of Service</Label>
                        <Input 
                          value={formData.typeOfService || ""} 
                          onChange={(e) => handleInputChange("typeOfService", e.target.value)}
                          placeholder="e.g., Plumbing, Electrical" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Service Description</Label>
                      <Textarea 
                        value={formData.description || ""} 
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Describe your services in detail" 
                        rows={3} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category (Service)</Label>
                        <Select 
                          value={selectedCategory}
                          onValueChange={(val) => {
                            setSelectedCategory(val);
                            handleInputChange("category", val);
                            const selectedCat = categories.find(c => c._id === val);
                            if (selectedCat?.autoFilled) {
                              setSelectedAutoFilled(selectedCat.autoFilled);
                              handleInputChange("subCategory", selectedCat.autoFilled);
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
                              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Category (Auto Filled)</Label>
                        <Input 
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
                          onChange={(e) => handleInputChange("yearOfEstablishment", e.target.value)}
                          placeholder="e.g., 2020" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Owner / Authorized Person Name</Label>
                        <Input 
                          value={formData.name || ""} 
                          onChange={(e) => handleInputChange("name", e.target.value)}
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
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter complete address" 
                        rows={2} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input 
                          value={formData.pincode || ""} 
                          onChange={(e) => handleInputChange("pincode", e.target.value)}
                          placeholder="Enter 6-digit pincode" 
                          maxLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Service Location / Area Covered</Label>
                        <Input 
                          value={formData.serviceLocation || ""} 
                          onChange={(e) => handleInputChange("serviceLocation", e.target.value)}
                          placeholder="e.g., Sagar, Bhopal, All MP" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Contact Number</Label>
                        <Input 
                          value={formData.phone || ""} 
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="10-digit number" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Alternate Contact Number</Label>
                        <Input 
                          value={formData.alternatePhone || ""} 
                          onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                          placeholder="10-digit number (optional)" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Do you have WhatsApp? <span className="text-red-500">*</span></Label>
                        <RadioGroup
                          value={hasWhatsApp === null ? "" : hasWhatsApp ? "yes" : "no"}
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
                            <Label htmlFor="whatsapp-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="whatsapp-no" />
                            <Label htmlFor="whatsapp-no" className="cursor-pointer">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {hasWhatsApp && (
                        <div className="space-y-2">
                          <Label>WhatsApp Number <span className="text-red-500">*</span></Label>
                          <Input 
                            value={formData.whatsappNumber || ""} 
                            onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                            placeholder="10-digit WhatsApp number" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email ID</Label>
                      <Input 
                        value={formData.email || ""} 
                        onChange={(e) => handleInputChange("email", e.target.value)}
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
                        onValueChange={(val) => handleInputChange("businessType", val)}
                        className="grid grid-cols-2 md:grid-cols-3 gap-3"
                      >
                        {["Proprietorship", "Partnership", "LLP", "Private Limited", "Other"].map((type) => (
                          <div key={type} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                            <RadioGroupItem value={type} id={type} />
                            <Label htmlFor={type} className="cursor-pointer">{type}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Aadhaar Number</Label>
                        <Input 
                          value={formData.adhar || ""} 
                          onChange={(e) => handleInputChange("adhar", e.target.value)}
                          placeholder="12-digit Aadhaar number" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PAN Number</Label>
                        <Input 
                          value={formData.pan || ""} 
                          onChange={(e) => handleInputChange("pan", e.target.value)}
                          placeholder="ABCDE1234F" 
                          className="uppercase" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>GST Number (if applicable)</Label>
                        <Input 
                          value={formData.gstNumber || ""} 
                          onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                          placeholder="Enter GST number" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trade License / Shop Act Registration No.</Label>
                        <Input 
                          value={formData.tradeLicense || ""} 
                          onChange={(e) => handleInputChange("tradeLicense", e.target.value)}
                          placeholder="Enter license number (if applicable)" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Bank Details */}
                {currentStep === 4 && (
                  <div className="space-y-4">
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
                          value={formData.bankDetail?.accountHolderName || ""} 
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
                          onChange={(e) => handleInputChange("numberOfStaff", Number(e.target.value))}
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
                              fields: e.target.value.split(",").map(f => f.trim()),
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
                              checked={workingDays[day.key as keyof typeof workingDays]}
                              onChange={(e) => {
                                const newDays = { ...workingDays, [day.key]: e.target.checked };
                                setWorkingDays(newDays);
                                const selectedDays = Object.entries(newDays)
                                  .filter(([, v]) => v)
                                  .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1, 3));
                                handleInputChange("workingDays", `${selectedDays.join(", ")} | ${workingTime}`);
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{day.label}</span>
                            {workingDays[day.key as keyof typeof workingDays] && (
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
                            .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1, 3));
                          handleInputChange("workingDays", `${selectedDays.join(", ")} | ${e.target.value}`);
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
                      📄 Upload or update documents (Aadhaar, PAN, GST Certificate, Address Proof, Business Registration, etc.)
                    </p>
                    
                    {/* Profile Photo */}
                    <div className="space-y-2">
                      <Label>Profile Photo</Label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-yellow-500 transition-colors">
                            {documents.profilePhoto ? (
                              <div className="flex items-center justify-center gap-2 text-green-600">
                                <Check size={20} />
                                <span className="truncate max-w-[200px]">
                                  {documents.profilePhoto?.name}
                                </span>
                              </div>
                            ) : vendor.profilePhoto && typeof vendor.profilePhoto === 'string' ? (
                              <div className="flex items-center justify-center gap-2 text-blue-600">
                                <FileText size={20} />
                                <span>Current photo uploaded</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-gray-500">
                                <Upload size={20} />
                                <span>Click to upload profile photo</span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange("profilePhoto", e.target.files?.[0] || null)}
                          />
                        </label>
                        {documents.profilePhoto && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleFileChange("profilePhoto", null)}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    </div>

                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="space-y-2">
                        <Label>Document {num}</Label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-yellow-500 transition-colors">
                              {documents[`document${num}`] ? (
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                  <Check size={20} />
                                  <span className="truncate max-w-[200px]">
                                    {documents[`document${num}`]?.name}
                                  </span>
                                </div>
                              ) : vendor[`document${num}` as keyof VendorData] && typeof vendor[`document${num}` as keyof VendorData] === 'string' ? (
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                  <FileText size={20} />
                                  <span>Current document {num} uploaded</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                  <Upload size={20} />
                                  <span>Click to upload document {num}</span>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(`document${num}`, e.target.files?.[0] || null)}
                            />
                          </label>
                          {documents[`document${num}`] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleFileChange(`document${num}`, null)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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
                          onChange={(e) => handleInputChange("referralCode", e.target.value)}
                          placeholder="Enter referral code if any" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Referral Name</Label>
                        <Input 
                          value={formData.referralName || ""} 
                          onChange={(e) => handleInputChange("referralName", e.target.value)}
                          placeholder="Enter referral name if any" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Admin Commission (%)</Label>
                      <p className="mt-1 text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {vendor?.percentage ? `${vendor.percentage}%` : "Not set"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <h4 className="font-semibold text-gray-800">Profile Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Business:</strong> {formData.company}</p>
                          <p><strong>Owner:</strong> {formData.name}</p>
                          <p><strong>Phone:</strong> {formData.phone}</p>
                          <p><strong>Email:</strong> {formData.email || "Not provided"}</p>
                        </div>
                        <div>
                          <p><strong>Business Type:</strong> {formData.businessType}</p>
                          <p><strong>Experience:</strong> {formData.experience?.totalYears || 0} years</p>
                          <p><strong>Staff:</strong> {formData.numberOfStaff || 0}</p>
                          <p><strong>Status:</strong> {vendor.status}</p>
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
                      {updating ? "Saving..." : "Save All Changes"} <Save size={18} />
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
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      {vendor.profilePhoto && typeof vendor.profilePhoto === 'string' ? (
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

                    <h2 className="text-xl font-semibold text-gray-900">
                      {vendor.name}
                    </h2>
                    <p className="text-gray-600">{vendor.company}</p>
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
                          <p className="font-medium">{vendor.yearOfEstablishment}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Pincode</Label>
                      <p className="mt-1 text-gray-900">
                        {vendor.pincode || "-"}
                      </p>
                    </div>
                    <div>
                      <Label>Service Location / Area Covered</Label>
                      <p className="mt-1 text-gray-900 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        {vendor.serviceLocation || "-"}
                      </p>
                    </div>
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

              {/* Bank Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      {vendor.profilePhoto && typeof vendor.profilePhoto === 'string' ? (
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
                        {vendor[`document${num}` as keyof VendorData] && typeof vendor[`document${num}` as keyof VendorData] === 'string' ? (
                          <a
                            href={vendor[`document${num}` as keyof VendorData] as string}
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

export default VendorProfileMangeByAdmin;
