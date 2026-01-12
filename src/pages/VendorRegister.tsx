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
import { ChevronLeft, ChevronRight, Check, Upload, X } from "lucide-react";

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
  serviceLocation: z.string().min(2, "Service location is required"),
  phone: z.string().regex(/^[1-9]\d{9}$/, "Phone must be 10 digits"),
  alternatePhone: z.string().regex(/^[1-9]\d{9}$/, "Must be 10 digits").optional().or(z.literal("")),
  whatsappNumber: z.string().regex(/^[1-9]\d{9}$/, "WhatsApp must be 10 digits"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  
  // Step 3: Business & Legal
  businessType: z.enum(["Proprietorship", "Partnership", "LLP", "Private Limited", "Other"]),
  gstNumber: z.string().optional().or(z.literal("")),
  pan: z.string().optional(),
  adhar: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits").optional().or(z.literal("")),
  tradeLicense: z.string().optional().or(z.literal("")),
  
  // Step 4: Bank Details
  bankName: z.string().optional().or(z.literal("")),
  accountHolderName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  ifscCode: z.string().optional().or(z.literal("")),
  
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
  autoFilled?: string;
}

const STEPS = [
  { id: 1, title: "Basic Info", icon: "📋" },
  { id: 2, title: "Contact", icon: "📞" },
  { id: 3, title: "Business", icon: "🏢" },
  { id: 4, title: "Bank", icon: "🏦" },
  { id: 5, title: "Experience", icon: "⭐" },
  { id: 6, title: "Documents", icon: "📄" },
  { id: 7, title: "Submit", icon: "✅" },
];

const VendorRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTermsAndPrivacy, setAcceptedTermsAndPrivacy] = useState(false);
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
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    document1: null,
    document2: null,
    document3: null,
    document4: null,
    document5: null,
  });

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

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    };
    fetchCategories();
    
    // Initialize working days value
    const selectedDays = Object.entries(workingDays)
      .filter(([, v]) => v)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1, 3));
    setValue("workingDays", `${selectedDays.join(", ")} | ${workingTime}`);
  }, []);

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: Record<number, (keyof VendorFormData)[]> = {
      1: ["company", "typeOfService", "description", "category", "subCategory", "name"],
      2: ["address", "serviceLocation", "phone", "whatsappNumber"],
      3: ["businessType"],
      4: [],
      5: ["workingDays"],
      6: [],
      7: ["password", "confirmPassword"],
    };
    
    const fields = fieldsToValidate[step];
    if (fields.length === 0) return true;
    return await trigger(fields);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 7) {
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

  const handleFileChange = (docKey: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [docKey]: file }));
  };

  const onSubmit = async (data: VendorFormData) => {
    if (!acceptedTermsAndPrivacy) {
      alert("Please accept Terms & Conditions and Privacy Policy");
      return;
    }

    const formData = {
      ...data,
      numberOfStaff: data.numberOfStaff ? parseInt(data.numberOfStaff) : 0,
      bankDetail: {
        accountNumber: data.accountNumber,
        IFSC: data.ifscCode,
        accountHolderName: data.accountHolderName,
        branch: data.bankName,
      },
      experience: {
        totalYears: data.totalYears ? parseInt(data.totalYears) : 0,
        fields: data.servicesOffered ? data.servicesOffered.split(",").map(s => s.trim()) : [],
      },
    };

    const response = await signUp(formData);
    if (response) navigate("/partner/login");
  };

  const progress = (currentStep / 7) * 100;

  return (
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
                          setSelectedCategory(val);
                          setValue("category", val);
                          const selectedCat = categories.find(c => c._id === val);
                          if (selectedCat?.autoFilled) {
                            setSelectedAutoFilled(selectedCat.autoFilled);
                            setValue("subCategory", selectedCat.autoFilled);
                          } else {
                            setSelectedAutoFilled("");
                            setValue("subCategory", "");
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
                      {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Category (Auto Filled) <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Auto-filled based on category" 
                        value={selectedAutoFilled}
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

                  <div className="space-y-2">
                    <Label>Service Location / Area Covered <span className="text-red-500">*</span></Label>
                    <Input {...register("serviceLocation")} placeholder="e.g., Sagar, Bhopal, All MP" />
                    {errors.serviceLocation && <p className="text-sm text-red-500">{errors.serviceLocation.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Contact Number <span className="text-red-500">*</span> <span className="text-xs text-blue-600">(Used for Login)</span></Label>
                      <Input {...register("phone")} placeholder="10-digit number" />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Alternate Contact Number</Label>
                      <Input {...register("alternatePhone")} placeholder="10-digit number (optional)" />
                      {errors.alternatePhone && <p className="text-sm text-red-500">{errors.alternatePhone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp Number <span className="text-red-500">*</span></Label>
                      <Input {...register("whatsappNumber")} placeholder="10-digit WhatsApp number" />
                      {errors.whatsappNumber && <p className="text-sm text-red-500">{errors.whatsappNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email ID</Label>
                      <Input {...register("email")} type="email" placeholder="email@example.com (optional)" />
                      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Aadhaar Number</Label>
                      <Input {...register("adhar")} placeholder="12-digit Aadhaar number (optional)" />
                      {errors.adhar && <p className="text-sm text-red-500">{errors.adhar.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>PAN Number</Label>
                      <Input {...register("pan")} placeholder="ABCDE1234F (optional)" className="uppercase" />
                      {errors.pan && <p className="text-sm text-red-500">{errors.pan.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>GST Number (if applicable)</Label>
                      <Input {...register("gstNumber")} placeholder="Enter GST number" />
                    </div>
                    <div className="space-y-2">
                      <Label>Trade License / Shop Act Registration No.</Label>
                      <Input {...register("tradeLicense")} placeholder="Enter license number (if applicable)" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Bank Details */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                    💡 Bank details are optional but recommended for faster payment processing.
                  </p>
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
                    📄 All documents are optional. You can upload up to 5 documents (Aadhaar, PAN, GST Certificate, Address Proof, Business Registration, etc.)
                  </p>
                  
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
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-gray-500">
                                <Upload size={20} />
                                <span>Click to upload</span>
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

              {/* Step 7: Declaration & Submit */}
              {currentStep === 7 && (
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
                    type="submit"
                    disabled={isSubmitting || !acceptedTermsAndPrivacy}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"} <Check size={18} />
                  </Button>
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
  );
};

export default VendorRegister;
