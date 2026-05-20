import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../service/operations/vendor";
import { getAllCategoriesAPI } from "../service/operations/category";
import { sendOTP, verifyOTP } from "../service/operations/otp";
import { imageUpload } from "../service/operations/image";
import { ChevronLeft, ChevronRight, Check, Upload, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

// Zod schema for validation
const vendorSchema = z.object({
  // Step 1: Basic Info
  company: z.string().min(2, "Business name is required"),
  typeOfService: z.string().min(2, "Type of service is required"),
  description: z.string().min(10, "Service description is required (min 10 chars)"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  yearOfEstablishment: z.string().optional(),
  name: z.string().min(2, "Owner name is required"),
  
  // Step 2: Contact Details
  address: z.string().min(5, "Address is required"),
  pincode: z.string().optional().or(z.literal("")),
  serviceLocation: z.string().min(2, "Service location is required"),
  phone: z.string().regex(/^[1-9]\d{9}$/, "Phone must be 10 digits"),
  alternatePhone: z.string().optional().refine((val) => {
    if (!val || val === "") return true; // Allow empty
    return /^[1-9]\d{9}$/.test(val); // Must be exactly 10 digits if provided
  }, {
    message: "Alternate phone must be exactly 10 digits"
  }),
  whatsappNumber: z.string().regex(/^[1-9]\d{9}$/, "WhatsApp must be 10 digits").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  
  // Step 3: Business & Legal
  businessType: z.enum(["Proprietorship", "Partnership", "LLP", "Private Limited", "Other"]),
  gstNumber: z.string().optional().or(z.literal("")),
  pan: z.string().optional(),
  adhar: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits").optional().or(z.literal("")),
  tradeLicense: z.string().optional().or(z.literal("")),
  
  // Step 4: Bank Details or UPI
  paymentMethod: z.enum(["bank", "upi"]).optional(),
  bankName: z.string().optional().or(z.literal("")),
  accountHolderName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  ifscCode: z.string().optional().or(z.literal("")),
  upiId: z.string().optional().or(z.literal("")),
  
  // Step 5: Experience
  totalYears: z.string().optional().or(z.literal("")),
  numberOfStaff: z.string().optional().or(z.literal("")),
  servicesOffered: z.string().optional().or(z.literal("")),
  workingDays: z.string().min(1, "Working days & timings required"),
  
  // Step 6: Documents (handled separately)
  
  // Step 7: Declaration
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  referralCode: z.string().optional().or(z.literal("")),
  referralName: z.string().optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface Category {
  _id: string;
  name: string;
  price: number;
  premiumPrice?: number;
  premiumPlusPrice?: number;
  autoFilled: string;
}

const STEPS = [
  { id: 1, title: "Basic Info", icon: "📋" },
  { id: 2, title: "Contact", icon: "📞" },
  { id: 3, title: "Business", icon: "🏢" },
  { id: 4, title: "Bank", icon: "🏦" },
  { id: 5, title: "Experience", icon: "⭐" },
  { id: 6, title: "Documents", icon: "📄" },
  { id: 7, title: "Portfolio", icon: "🖼️" },
  { id: 8, title: "Submit", icon: "✅" },
];

const VendorRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // Back to step 1
  const [acceptedTermsAndPrivacy, setAcceptedTermsAndPrivacy] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryData, setSelectedCategoryData] = useState<Category | null>(null);
  const [selectedPriceTier, setSelectedPriceTier] = useState<"basic" | "premium" | "premiumPlus">("basic");
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
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">("bank");
  const [selectedDocumentType, setSelectedDocumentType] = useState<"aadhaar" | "pan" | "gst" | "tradeLicense" | "">("");
  const [businessDocuments, setBusinessDocuments] = useState<{
    aadhaarFront: File | null;
    aadhaarBack: File | null;
    panCard: File | null;
    gstCertificate: File | null;
    tradeLicenseDoc: File | null;
  }>({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    gstCertificate: null,
    tradeLicenseDoc: null,
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<Array<{ public_id: string; url: string }>>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);

  // Simple OTP states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessType: "Proprietorship",
    },
  });

  const ownerName = watch("name");

  // Get current price based on selected tier
  const getCurrentPrice = () => {
    if (!selectedCategoryData) return 0;
    switch (selectedPriceTier) {
      case "premium":
        return selectedCategoryData.premiumPrice || selectedCategoryData.price;
      case "premiumPlus":
        return selectedCategoryData.premiumPlusPrice || selectedCategoryData.price;
      default:
        return selectedCategoryData.price;
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔍 Fetching categories...");
        const data = await getAllCategoriesAPI();
        console.log("📥 Categories received:", data);
        console.log("📊 Categories count:", data?.length || 0);
        if (data && data.length > 0) {
          console.log("📋 First category sample:", data[0]);
          console.log("🏷️ Sample category fields:", {
            id: data[0]._id,
            name: data[0].name,
            price: data[0].price,
            premiumPrice: data[0].premiumPrice,
            premiumPlusPrice: data[0].premiumPlusPrice,
            autoFilled: data[0].autoFilled
          });
        }
        setCategories(data || []);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    };
    fetchCategories();
    
    // Initialize working days value
    const selectedDays = Object.entries(workingDays)
      .filter(([, v]) => v)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1, 3));
    setValue("workingDays", `${selectedDays.join(", ")} | ${workingTime}`);
  }, []);

  // Check verification status when phone/whatsapp numbers change
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const phoneNumber = watch("phone");
      const whatsappNumber = watch("whatsappNumber");
      
      // Reset verification status when numbers change
      if (phoneNumber || whatsappNumber) {
        setIsPhoneVerified(false);
        setOtpSent(false);
        setOtp('');
      }
    };
    
    checkVerificationStatus();
  }, [watch("phone"), watch("whatsappNumber"), hasWhatsApp]);

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: Record<number, (keyof VendorFormData)[]> = {
      1: ["company", "typeOfService", "description", "category", "subCategory", "name"],
      2: ["address", "serviceLocation", "phone", "alternatePhone"],
      3: ["businessType"],
      4: [],
      5: ["workingDays"],
      6: [],
      7: [],
      8: ["password", "confirmPassword"],
    };
    
    // Add WhatsApp validation for step 2 if user has WhatsApp
    if (step === 2 && hasWhatsApp) {
      fieldsToValidate[2].push("whatsappNumber");
    }
    
    // Check if WhatsApp selection is made for step 2
    if (step === 2 && hasWhatsApp === null) {
      toast.error("Please select whether you have WhatsApp or not");
      return false;
    }
    
    // Check OTP verification for step 2
    if (step === 2 && !isPhoneVerified) {
      toast.error("Please verify your phone number with OTP before proceeding");
      return false;
    }
    
    // Check if document type is selected and files are uploaded for step 3
    if (step === 3) {
      if (!selectedDocumentType) {
        toast.error("Please select a document type to upload");
        return false;
      }
      
      if (selectedDocumentType === "aadhaar") {
        if (!businessDocuments.aadhaarFront || !businessDocuments.aadhaarBack) {
          toast.error("Please upload both front and back of Aadhaar card");
          return false;
        }
      } else if (selectedDocumentType === "pan") {
        if (!businessDocuments.panCard) {
          toast.error("Please upload PAN card");
          return false;
        }
      } else if (selectedDocumentType === "gst") {
        if (!businessDocuments.gstCertificate) {
          toast.error("Please upload GST certificate");
          return false;
        }
      } else if (selectedDocumentType === "tradeLicense") {
        if (!businessDocuments.tradeLicenseDoc) {
          toast.error("Please upload Trade License document");
          return false;
        }
      }
    }
    
    const fields = fieldsToValidate[step];
    if (fields.length === 0) return true;
    return await trigger(fields);
  };

  // Simple OTP functions
  const handleSendOTP = async () => {
    const phoneNumber = watch("phone");
    const whatsappNumber = watch("whatsappNumber");
    
    // Determine which number to verify based on WhatsApp selection
    let numberToVerify;
    let preferredMethod;
    
    if (hasWhatsApp) {
      // If user has WhatsApp, verify WhatsApp number
      numberToVerify = whatsappNumber;
      preferredMethod = 'whatsapp';
      
      if (!whatsappNumber || whatsappNumber.length !== 10) {
        toast.error('Please enter a valid 10-digit WhatsApp number');
        return;
      }
    } else {
      // If user doesn't have WhatsApp, verify phone number via SMS
      numberToVerify = phoneNumber;
      preferredMethod = 'sms';
      
      if (!phoneNumber || phoneNumber.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
    }

    setOtpLoading(true);
    
    const otpData: any = {
      phone: numberToVerify, // Use the number to be verified as the primary phone
      preferredMethod: preferredMethod,
      forceResend: true // Add this flag to force resend even if already verified
    };
    
    // For WhatsApp, also send the WhatsApp number
    if (hasWhatsApp && whatsappNumber) {
      otpData.whatsappNumber = whatsappNumber;
    }

    const result = await sendOTP(otpData);
    
    if (result.success) {
      setOtpSent(true);
      // Reset verification status to allow re-verification
      setIsPhoneVerified(false);
      // Clear the OTP input when resending
      setOtp('');
      
      // Don't show additional toast here - sendOTP already shows it
      // The toast from sendOTP function will display the correct message
    }
    
    setOtpLoading(false);
  };

  const handleVerifyOTP = async () => {
    const phoneNumber = watch("phone");
    const whatsappNumber = watch("whatsappNumber");
    
    // Use the same number that was used for sending OTP
    const numberToVerify = hasWhatsApp ? whatsappNumber : phoneNumber;
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    
    const result = await verifyOTP({
      phone: numberToVerify,
      otp: otp
    });
    
    if (result.success) {
      setIsPhoneVerified(true);
      setOtpSent(false);
      setOtp('');
    }
    
    setOtpLoading(false);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 8) {
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

  const handleBusinessDocumentChange = (docKey: keyof typeof businessDocuments, file: File | null) => {
    console.log(`📄 Business document change - ${docKey}:`, file ? file.name : "removed");
    setBusinessDocuments(prev => {
      const updated = { ...prev, [docKey]: file };
      console.log("📋 Updated business documents state:", Object.keys(updated).filter(key => updated[key]));
      return updated;
    });
  };

  const handlePortfolioImagesChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newImages = Array.from(files);
    const totalImages = portfolioImages.length + newImages.length;
    
    if (totalImages > 10) {
      toast.error("You can upload maximum 10 portfolio images");
      return;
    }
    
    setPortfolioUploading(true);
    try {
      // Upload images to server and get URLs
      const uploadedImages = await imageUpload(newImages);
      
      if (uploadedImages && uploadedImages.length > 0) {
        const formattedImages = uploadedImages.map((img: any) => ({
          public_id: img.asset_id || img.public_id,
          url: img.url
        }));
        
        setPortfolioImages(prev => [...prev, ...formattedImages]);
        toast.success(`${uploadedImages.length} image(s) uploaded successfully!`);
        console.log(`🖼️ Portfolio images uploaded: ${uploadedImages.length}, Total: ${portfolioImages.length + uploadedImages.length}`);
      }
    } catch (error) {
      console.error("Portfolio upload error:", error);
      toast.error("Failed to upload portfolio images");
    } finally {
      setPortfolioUploading(false);
    }
  };

  const removePortfolioImage = (publicId: string) => {
    setPortfolioImages(prev => prev.filter(img => img.public_id !== publicId));
    console.log(`🗑️ Portfolio image removed: ${publicId}`);
  };

  const onSubmit = async (data: VendorFormData) => {
    if (!acceptedTermsAndPrivacy) {
      alert("Please accept Terms & Conditions and Privacy Policy");
      return;
    }

    // Include category and subCategory in vendor registration data
    const { category, subCategory, ...vendorData } = data;

    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add basic form fields (avoid duplicates)
    const fieldsToSkip = ['accountNumber', 'ifscCode', 'accountHolderName', 'bankName', 'totalYears', 'servicesOffered', 'paymentMethod', 'upiId', 'numberOfStaff'];
    
    Object.entries(vendorData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && !fieldsToSkip.includes(key)) {
        formData.append(key, value.toString());
      }
    });
    
    // Add category and subCategory
    if (category) formData.append("category", category);
    if (subCategory) formData.append("subCategory", subCategory);
    
    // Add price tier information
    formData.append("priceTier", selectedPriceTier);
    formData.append("selectedPrice", getCurrentPrice().toString());
    
    // Add numberOfStaff as single value (ensure no duplicates)
    if (vendorData.numberOfStaff) {
      const staffCount = parseInt(vendorData.numberOfStaff).toString();
      formData.append("numberOfStaff", staffCount);
      console.log("👥 Adding numberOfStaff:", staffCount);
    } else {
      formData.append("numberOfStaff", "0");
      console.log("👥 Adding default numberOfStaff: 0");
    }
    
    // Payment details - Bank or UPI (add only once)
    formData.append("paymentMethod", paymentMethod);
    
    if (paymentMethod === "bank") {
      // Bank details
      if (vendorData.accountNumber) formData.append("bankDetail[accountNumber]", vendorData.accountNumber);
      if (vendorData.ifscCode) formData.append("bankDetail[IFSC]", vendorData.ifscCode);
      if (vendorData.accountHolderName) formData.append("bankDetail[accountHolderName]", vendorData.accountHolderName);
      if (vendorData.bankName) formData.append("bankDetail[branch]", vendorData.bankName);
    } else if (paymentMethod === "upi") {
      // UPI details
      if (vendorData.upiId) formData.append("upiId", vendorData.upiId);
    }
    
    // Experience (add only once)
    if (vendorData.totalYears) {
      formData.append("experience[totalYears]", parseInt(vendorData.totalYears).toString());
    } else {
      formData.append("experience[totalYears]", "0");
    }
    
    if (vendorData.servicesOffered) {
      const services = vendorData.servicesOffered.split(",").map(s => s.trim());
      services.forEach(service => {
        formData.append("experience[fields]", service);
      });
    }
    
    // Add profile photo if selected
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }
    
    // Add business documents in the format backend expects (document1, document2, etc.)
    formData.append("selectedDocumentType", selectedDocumentType);
    
    if (selectedDocumentType === "aadhaar") {
      if (businessDocuments.aadhaarFront) {
        formData.append("document1", businessDocuments.aadhaarFront);
        console.log("📄 Adding document1 (Aadhaar Front):", businessDocuments.aadhaarFront.name);
      }
      if (businessDocuments.aadhaarBack) {
        formData.append("document2", businessDocuments.aadhaarBack);
        console.log("📄 Adding document2 (Aadhaar Back):", businessDocuments.aadhaarBack.name);
      }
    } else if (selectedDocumentType === "pan") {
      if (businessDocuments.panCard) {
        formData.append("document1", businessDocuments.panCard);
        console.log("📄 Adding document1 (PAN Card):", businessDocuments.panCard.name);
      }
    } else if (selectedDocumentType === "gst") {
      if (businessDocuments.gstCertificate) {
        formData.append("document1", businessDocuments.gstCertificate);
        console.log("📄 Adding document1 (GST Certificate):", businessDocuments.gstCertificate.name);
      }
    } else if (selectedDocumentType === "tradeLicense") {
      if (businessDocuments.tradeLicenseDoc) {
        formData.append("document1", businessDocuments.tradeLicenseDoc);
        console.log("📄 Adding document1 (Trade License):", businessDocuments.tradeLicenseDoc.name);
      }
    }
    
    // Add portfolio images URLs (already uploaded to server)
    if (portfolioImages.length > 0) {
      console.log(`🖼️ Adding ${portfolioImages.length} portfolio image URLs to FormData`);
      formData.append("portfolioImages", JSON.stringify(portfolioImages));
      console.log("Portfolio images data:", portfolioImages);
    }
    
    // Debug: Log all FormData entries and check for duplicates
    console.log("📋 FormData entries:");
    const formDataEntries = [];
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${value.size} bytes)`);
        formDataEntries.push(`${key}: FILE`);
      } else {
        console.log(`${key}: ${value}`);
        formDataEntries.push(`${key}: ${value}`);
      }
    }
    
    // Check for duplicate keys
    const keyCount: Record<string, number> = {};
    formDataEntries.forEach(entry => {
      const key = entry.split(':')[0];
      keyCount[key] = (keyCount[key] || 0) + 1;
    });
    
    const duplicates = Object.entries(keyCount).filter(([key, count]) => (count as number) > 1);
    if (duplicates.length > 0) {
      console.warn("⚠️ Duplicate FormData keys detected:", duplicates);
    }

    const response = await signUp(formData);
    if (response?.success) {
      console.log("🔍 VendorRegister: Registration successful");
      console.log("📋 Response data:", {
        success: response.success,
        userId: response.user?._id,
        userName: response.user?.name,
        userEmail: response.user?.email
      });
      
      // Navigate to category purchase page instead of showing modal
      if (selectedCategory && response.user?._id) {
        const params = new URLSearchParams({
          vendorId: response.user._id,
          categoryId: selectedCategory,
          vendorName: vendorData.name,
          vendorEmail: vendorData.email || "",
          vendorPhone: vendorData.phone,
          isAdmin: "false", // External registration is not admin
        });
        
        console.log("🔗 Navigating to category purchase with params:", {
          vendorId: response.user._id,
          categoryId: selectedCategory,
          vendorName: vendorData.name,
          vendorEmail: vendorData.email || "",
          vendorPhone: vendorData.phone,
        });
        
        navigate(`/category-purchase?${params.toString()}`);
      } else {
        console.log("⚠️ No category selected or no user ID, redirecting to login");
        // If no category selected, redirect to login
        navigate("/partner/login");
      }
    } else {
      console.log("❌ Registration failed:", response);
      
      // Show specific error details if available
      if (response?.error?.uploadedFiles) {
        console.log("📁 Files that were uploaded successfully:", response.error.uploadedFiles);
        console.log("📊 Upload statistics:", {
          attempted: response.error.totalFilesAttempted,
          successful: response.error.uploadedFiles.length,
          failed: response.error.totalFilesAttempted - response.error.uploadedFiles.length
        });
      }
    }
  };

  const progress = (currentStep / 8) * 100;

  return (
   <div>
    <Navbar/>
 <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Provider Registration</h1>
          <p className="text-gray-600">Join Niyati Solutions and grow your business</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between overflow-x-auto pb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-[80px] cursor-pointer ${
                  currentStep >= step.id ? "text-yellow-600" : "text-gray-400"
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
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
              Step {currentStep}: {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Service Provider / Business Name <span className="text-red-500">*</span></Label>
                      <Input {...register("company")} placeholder="Enter business name" />
                      {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Type of Service <span className="text-red-500">*</span></Label>
                      <Input {...register("typeOfService")} placeholder="e.g., Plumbing, Electrical" />
                      {errors.typeOfService && <p className="text-sm text-red-500">{errors.typeOfService.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Description <span className="text-red-500">*</span></Label>
                    <Textarea {...register("description")} placeholder="Describe your services in detail" rows={3} />
                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category (Service) <span className="text-red-500">*</span></Label>
                      <Select 
                        value={selectedCategory}
                        onValueChange={(val) => {
                          console.log("🎯 Category selected:", val);
                          setSelectedCategory(val);
                          setValue("category", val);
                          const selectedCat = categories.find(c => c._id === val);
                          console.log("📋 Selected category data:", selectedCat);
                          setSelectedCategoryData(selectedCat || null);
                          if (selectedCat?.autoFilled) {
                            console.log("✅ Auto-filling with:", selectedCat.autoFilled);
                            setSelectedAutoFilled(selectedCat.autoFilled);
                            setValue("subCategory", selectedCat.autoFilled);
                          } else {
                            console.log("❌ No autoFilled value found");
                            setSelectedAutoFilled("");
                            setValue("subCategory", "");
                          }
                          // Reset price tier when category changes
                          setSelectedPriceTier("basic");
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
                      {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                    </div>

                  

                    <div className="space-y-2">
                      <Label>Sub Category (Auto Filled) <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Auto-filled based on category" 
                        value={selectedAutoFilled}
                        disabled
                        onChange={(e) => {
                          setSelectedAutoFilled(e.target.value);
                          setValue("subCategory", e.target.value);
                        }}
                        className="bg-gray-50"
                      />
                      {errors.subCategory && <p className="text-sm text-red-500">{errors.subCategory.message}</p>}
                      <p className="text-xs text-gray-500">This field auto-fills when you select a category</p>
                    </div>
                  </div>

                    {/* Price Tier Selection - Show only when category is selected */}
                    {/* {selectedCategoryData && (
                      <div className="space-y-2">
                        <Label>Select Plan <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedPriceTier === "basic" 
                              ? "border-green-500 bg-green-50 text-green-700" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}>
                            <input
                              type="radio"
                              name="priceTier"
                              value="basic"
                              checked={selectedPriceTier === "basic"}
                              onChange={() => setSelectedPriceTier("basic")}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <div className="font-semibold text-sm">Basic Plan</div>
                              <div className="text-lg font-bold">₹{selectedCategoryData.price}</div>
                              <div className="text-xs text-gray-500 mt-1">Standard features</div>
                            </div>
                          </label>

                          {selectedCategoryData.premiumPrice && selectedCategoryData.premiumPrice > 0 && (
                            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedPriceTier === "premium" 
                                ? "border-orange-500 bg-orange-50 text-orange-700" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}>
                              <input
                                type="radio"
                                name="priceTier"
                                value="premium"
                                checked={selectedPriceTier === "premium"}
                                onChange={() => setSelectedPriceTier("premium")}
                                className="sr-only"
                              />
                              <div className="text-center">
                                <div className="font-semibold text-sm">Premium Plan</div>
                                <div className="text-lg font-bold">₹{selectedCategoryData.premiumPrice}</div>
                                <div className="text-xs text-gray-500 mt-1">Enhanced features</div>
                              </div>
                            </label>
                          )}

                          {selectedCategoryData.premiumPlusPrice > 0 && (
                            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedPriceTier === "premiumPlus" 
                                ? "border-purple-500 bg-purple-50 text-purple-700" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}>
                              <input
                                type="radio"
                                name="priceTier"
                                value="premiumPlus"
                                checked={selectedPriceTier === "premiumPlus"}
                                onChange={() => setSelectedPriceTier("premiumPlus")}
                                className="sr-only"
                              />
                              <div className="text-center">
                                <div className="font-semibold text-sm">Premium Plus</div>
                                <div className="text-lg font-bold">₹{selectedCategoryData.premiumPlusPrice}</div>
                                <div className="text-xs text-gray-500 mt-1">All premium features</div>
                              </div>
                            </label>
                          )}
                        </div>
                        
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-center">
                            <span className="text-sm text-blue-600">Selected Plan Price: </span>
                            <span className="text-xl font-bold text-blue-700">₹{getCurrentPrice()}</span>
                          </div>
                        </div>
                      </div>
                    )} */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Year of Establishment</Label>
                      <Input {...register("yearOfEstablishment")} placeholder="e.g., 2020" />
                    </div>
                    <div className="space-y-2">
                      <Label>Owner / Authorized Person Name <span className="text-red-500">*</span></Label>
                      <Input {...register("name")} placeholder="Enter owner name" />
                      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Registered Office / Home Address <span className="text-red-500">*</span></Label>
                    <Textarea {...register("address")} placeholder="Enter complete address" rows={2} />
                    {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input 
                        {...register("pincode")} 
                        placeholder="Enter 6-digit pincode" 
                        maxLength={6}
                      />
                      {errors.pincode && <p className="text-sm text-red-500">{errors.pincode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Service Location / Area Covered <span className="text-red-500">*</span></Label>
                      <LocationAutocomplete
                        value={watch("serviceLocation") || ""}
                        onChange={(value) => setValue("serviceLocation", value)}
                        placeholder="Search location (e.g., Sagar, Bhopal, All MP)"
                        error={errors.serviceLocation?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Contact Number <span className="text-red-500">*</span>
                        {hasWhatsApp === false && isPhoneVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          {...register("phone")} 
                          placeholder="10-digit number" 
                          className={hasWhatsApp === false && isPhoneVerified ? "bg-green-50 border-green-200" : ""}
                        />
                        {hasWhatsApp === false && (
                          <Button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading || !watch("phone") || watch("phone").length !== 10}
                            className="whitespace-nowrap"
                            variant="outline"
                          >
                            {otpLoading ? "Sending..." : isPhoneVerified ? "Resend" : "Verify"}
                          </Button>
                        )}
                      </div>
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                      {hasWhatsApp === false && isPhoneVerified && (
                        <p className="text-xs text-green-600">Phone number verified! ✓</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Alternate Contact Number</Label>
                      <Input {...register("alternatePhone")} placeholder="10-digit number (optional)" />
                      {errors.alternatePhone && <p className="text-sm text-red-500">{errors.alternatePhone.message}</p>}
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
                            setValue("whatsappNumber", "");
                            // Reset verification status when WhatsApp option changes
                            setIsPhoneVerified(false);
                            setOtpSent(false);
                            setOtp('');
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
                        <Label>WhatsApp Number <span className="text-red-500">*</span>
                          {isPhoneVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                        </Label>
                        <div className="flex gap-2">
                          <Input 
                            {...register("whatsappNumber")} 
                            placeholder="10-digit WhatsApp number" 
                            className={isPhoneVerified ? "bg-green-50 border-green-200" : ""}
                          />
                          <Button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading || !watch("whatsappNumber") || watch("whatsappNumber").length !== 10}
                            className="whitespace-nowrap"
                            variant="outline"
                          >
                            {otpLoading ? "Sending..." : isPhoneVerified ? "Resend" : "Verify"}
                          </Button>
                        </div>
                        {errors.whatsappNumber && <p className="text-sm text-red-500">{errors.whatsappNumber.message}</p>}
                        {isPhoneVerified && (
                          <p className="text-xs text-green-600">WhatsApp number verified! ✓</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* OTP Verification Section */}
                  {otpSent && !isPhoneVerified && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="text-center">
                        <p className="text-blue-800 font-medium">
                          OTP sent to your {hasWhatsApp ? 'WhatsApp' : 'phone'}: 
                          <span className="font-bold"> {hasWhatsApp ? watch("whatsappNumber") : watch("phone")}</span>
                        </p>
                        <p className="text-blue-600 text-sm">Enter the 6-digit code below</p>
                        {hasWhatsApp && (
                          <p className="text-green-600 text-xs mt-1">
                            💬 WhatsApp OTP sent! Check your WhatsApp messages.
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtp(value);
                          }}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={otpLoading || otp.length !== 6}
                          className="whitespace-nowrap"
                        >
                          {otpLoading ? "Verifying..." : "Verify OTP"}
                        </Button>
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          onClick={handleSendOTP}
                          variant="link"
                          disabled={otpLoading}
                          className="text-sm"
                        >
                          Resend OTP
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email ID</Label>
                      <Input {...register("email")} type="email" placeholder="email@example.com (optional)" />
                      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* OTP Verification Warning */}
                  {!isPhoneVerified && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700 font-medium">
                            ⚠️ OTP Verification Required
                          </p>
                          <p className="text-sm text-yellow-600 mt-1">
                            Please verify your {hasWhatsApp ? 'WhatsApp number' : 'phone number'} with OTP before proceeding to the next step.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isPhoneVerified && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700 font-medium">
                            ✓ Phone Number Verified
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            You can now proceed to the next step.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Business & Legal */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Business Type <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      defaultValue="Proprietorship"
                      onValueChange={(val) => setValue("businessType", val as any)}
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

                  {/* Document Upload Section */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 mt-1">📄</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">Business Document Upload</h4>
                        <p className="text-sm text-blue-700">
                          Please select one document type and upload the required files. This is mandatory for verification.
                        </p>
                      </div>
                    </div>

                    {/* Document Type Selection */}
                    <div className="space-y-2">
                      <Label>Select Document Type <span className="text-red-500">*</span></Label>
                      <Select 
                        value={selectedDocumentType}
                        onValueChange={(val: any) => setSelectedDocumentType(val)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Choose document to upload" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aadhaar">Aadhaar Card (Front & Back)</SelectItem>
                          <SelectItem value="pan">PAN Card</SelectItem>
                          <SelectItem value="gst">GST Certificate</SelectItem>
                          <SelectItem value="tradeLicense">Trade License</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Conditional File Upload based on Document Type */}
                    {selectedDocumentType === "aadhaar" && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                          📸 Please upload both front and back images of your Aadhaar card
                        </p>
                        
                        {/* Aadhaar Number Input */}
                        <div className="space-y-2">
                          <Label>Aadhaar Number</Label>
                          <Input {...register("adhar")} placeholder="12-digit Aadhaar number (optional)" />
                          {errors.adhar && <p className="text-sm text-red-500">{errors.adhar.message}</p>}
                        </div>
                        
                        {/* Aadhaar Front */}
                        <div className="space-y-2">
                          <Label>Aadhaar Card - Front Side <span className="text-red-500">*</span></Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                !businessDocuments.aadhaarFront ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                              }`}>
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
                                onChange={(e) => handleBusinessDocumentChange('aadhaarFront', e.target.files?.[0] || null)}
                              />
                            </label>
                            {businessDocuments.aadhaarFront && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleBusinessDocumentChange('aadhaarFront', null)}
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Aadhaar Back */}
                        <div className="space-y-2">
                          <Label>Aadhaar Card - Back Side <span className="text-red-500">*</span></Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                                !businessDocuments.aadhaarBack ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                              }`}>
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
                                onChange={(e) => handleBusinessDocumentChange('aadhaarBack', e.target.files?.[0] || null)}
                              />
                            </label>
                            {businessDocuments.aadhaarBack && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleBusinessDocumentChange('aadhaarBack', null)}
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
                          <Input {...register("pan")} placeholder="ABCDE1234F (optional)" className="uppercase" />
                          {errors.pan && <p className="text-sm text-red-500">{errors.pan.message}</p>}
                        </div>
                        
                        {/* PAN Card Upload */}
                        <Label>PAN Card <span className="text-red-500">*</span></Label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                              !businessDocuments.panCard ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                            }`}>
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
                              onChange={(e) => handleBusinessDocumentChange('panCard', e.target.files?.[0] || null)}
                            />
                          </label>
                          {businessDocuments.panCard && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleBusinessDocumentChange('panCard', null)}
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
                          <Input {...register("gstNumber")} placeholder="Enter GST number" />
                        </div>
                        
                        {/* GST Certificate Upload */}
                        <Label>GST Certificate <span className="text-red-500">*</span></Label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                              !businessDocuments.gstCertificate ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                            }`}>
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
                              onChange={(e) => handleBusinessDocumentChange('gstCertificate', e.target.files?.[0] || null)}
                            />
                          </label>
                          {businessDocuments.gstCertificate && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleBusinessDocumentChange('gstCertificate', null)}
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
                          <Label>Trade License / Shop Act Registration No.</Label>
                          <Input {...register("tradeLicense")} placeholder="Enter license number" />
                        </div>
                        
                        {/* Trade License Upload */}
                        <Label>Trade License <span className="text-red-500">*</span></Label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${
                              !businessDocuments.tradeLicenseDoc ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                            }`}>
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
                              onChange={(e) => handleBusinessDocumentChange('tradeLicenseDoc', e.target.files?.[0] || null)}
                            />
                          </label>
                          {businessDocuments.tradeLicenseDoc && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleBusinessDocumentChange('tradeLicenseDoc', null)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {!selectedDocumentType && (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">Please select a document type from the dropdown above</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Bank Details or UPI */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                    💡 Payment details are optional but recommended for faster payment processing.
                  </p>
                  
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label>Select Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(val: "bank" | "upi") => {
                        setPaymentMethod(val);
                        setValue("paymentMethod", val);
                      }}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 flex-1">
                        <RadioGroupItem value="bank" id="payment-bank" />
                        <Label htmlFor="payment-bank" className="cursor-pointer flex-1">
                          <div className="font-semibold">Bank Account</div>
                          <div className="text-xs text-gray-500">Enter your bank details</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 flex-1">
                        <RadioGroupItem value="upi" id="payment-upi" />
                        <Label htmlFor="payment-upi" className="cursor-pointer flex-1">
                          <div className="font-semibold">UPI ID</div>
                          <div className="text-xs text-gray-500">Enter your UPI ID</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Bank Details Fields */}
                  {paymentMethod === "bank" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input {...register("bankName")} placeholder="Enter bank name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Holder Name</Label>
                          <Input {...register("accountHolderName")} placeholder="Name as per bank account" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input {...register("accountNumber")} placeholder="Enter account number" />
                        </div>
                        <div className="space-y-2">
                          <Label>IFSC Code</Label>
                          <Input {...register("ifscCode")} placeholder="Enter IFSC code" className="uppercase" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* UPI ID Field */}
                  {paymentMethod === "upi" && (
                    <div className="space-y-2">
                      <Label>UPI ID</Label>
                      <Input 
                        {...register("upiId")} 
                        placeholder="Enter UPI ID (e.g., yourname@paytm, 9876543210@ybl)" 
                      />
                      <p className="text-xs text-gray-500">
                        💡 Enter your UPI ID from any UPI app (PhonePe, Google Pay, Paytm, etc.)
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
                      <Input {...register("totalYears")} type="number" placeholder="e.g., 5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Technicians / Staff</Label>
                      <Input {...register("numberOfStaff")} type="number" placeholder="e.g., 3" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Services Offered (comma separated)</Label>
                    <Textarea
                      {...register("servicesOffered")}
                      placeholder="e.g., AC Repair, AC Installation, AC Service"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Working Days <span className="text-red-500">*</span></Label>
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
                              setValue("workingDays", `${selectedDays.join(", ")} | ${workingTime}`);
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
                        setValue("workingDays", `${selectedDays.join(", ")} | ${e.target.value}`);
                      }}
                      placeholder="e.g., 9 AM - 7 PM" 
                    />
                    {errors.workingDays && <p className="text-sm text-red-500">{errors.workingDays.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 6: Documents */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                    📸 Upload your profile photo (optional but recommended). This will be displayed on your vendor profile.
                  </p>
                  
                  {/* Profile Photo Section */}
                  <div className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <Label className="text-yellow-800 font-semibold">Profile Photo (Recommended)</Label>
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
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-yellow-600">
                              <div className="w-32 h-32 rounded-full bg-yellow-100 flex items-center justify-center border-4 border-yellow-300">
                                <Upload size={40} />
                              </div>
                              <span className="font-medium">Click to upload profile photo</span>
                              <span className="text-sm text-gray-500">JPG, PNG or JPEG (Max 5MB)</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
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
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Business Document Uploaded
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          You have already uploaded your {selectedDocumentType === "aadhaar" ? "Aadhaar Card" : 
                            selectedDocumentType === "pan" ? "PAN Card" : 
                            selectedDocumentType === "gst" ? "GST Certificate" : "Trade License"} in the Business step.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Declaration & Submit */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 bg-purple-50 p-3 rounded-lg border border-purple-200">
                    🖼️ Upload your work portfolio images (optional but recommended). You can upload up to 10 images showcasing your previous work.
                  </p>
                  
                  {/* Portfolio Images Upload */}
                  <div className="space-y-3">
                    <Label className="text-purple-800 font-semibold">
                      Portfolio Images (Max 10)
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({portfolioImages.length}/10 uploaded)
                      </span>
                    </Label>
                    
                    {/* Upload Button */}
                    {portfolioImages.length < 10 && (
                      <label className={`cursor-pointer ${portfolioUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors bg-white">
                          <div className="flex flex-col items-center gap-2 text-purple-600">
                            <Upload size={32} />
                            <span className="font-medium">
                              {portfolioUploading ? "Uploading..." : "Click to upload portfolio images"}
                            </span>
                            <span className="text-sm text-gray-500">
                              Select multiple images (JPG, PNG, JPEG)
                            </span>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          disabled={portfolioUploading}
                          onChange={(e) => handlePortfolioImagesChange(e.target.files)}
                        />
                      </label>
                    )}
                    
                    {/* Portfolio Images Preview Grid */}
                    {portfolioImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {portfolioImages.map((image, index) => (
                          <div key={image.public_id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={image.url}
                                alt={`Portfolio ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePortfolioImage(image.public_id)}
                            >
                              <X size={14} />
                            </Button>
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {portfolioImages.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No portfolio images uploaded yet</p>
                        <p className="text-xs mt-1">Upload images to showcase your work</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 8: Declaration & Submit */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Password <span className="text-red-500">*</span></Label>
                      <Input {...register("password")} type="password" placeholder="Create password" />
                      {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password <span className="text-red-500">*</span></Label>
                      <Input {...register("confirmPassword")} type="password" placeholder="Confirm password" />
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Referral Code (optional)</Label>
                      <Input {...register("referralCode")} placeholder="Enter referral code if any" />
                    </div>
                    <div className="space-y-2">
                      <Label>Referral Name (optional)</Label>
                      <Input {...register("referralName")} placeholder="Enter referral name if any" />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-800">Declaration & Undertaking</h4>
                    <p className="text-sm text-gray-600">
                      I, <span className="font-semibold text-gray-800">{ownerName || "_______________"}</span>, hereby declare that the information provided above is true, correct, and complete. 
                      I understand that Niyati Solutions reserves the right to verify the details and take 
                      necessary action, including suspension or removal of listing, in case of false or 
                      misleading information. I also confirm that I shall provide services in a professional, 
                      timely, and ethical manner, maintaining Niyati Solutions guidelines.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="termsAndPrivacy"
                        checked={acceptedTermsAndPrivacy}
                        onChange={(e) => setAcceptedTermsAndPrivacy(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="termsAndPrivacy" className="text-sm">
                        I agree to the{" "}
                        <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">
                          Terms & Conditions
                        </Link>
                        {" "}and{" "}
                        <Link to="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                        <span className="text-red-500"> *</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 pt-4 border-t space-y-4">
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft size={18} /> Previous
                  </Button>

                  {currentStep < 8 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      Next <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting || !acceptedTermsAndPrivacy}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {isSubmitting ? "Processing..." : "Pay Now"} <Check size={18} />
                    </Button>
                  )}
                </div>

                {currentStep === 8 && (
                  <p className="text-sm text-red-600 font-medium bg-blue-50 px-4 py-2 rounded-md text-center border border-blue-200">
                    <span className="font-semibold">Note:</span> Payment is required to complete registration
                  </p>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center border-t pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/partner/login" className="text-blue-600 hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer/>
   </div>
  );
};

export default VendorRegister;
