import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  BadgeIcon as IdCard,
  Percent,
  User,
  Search,
  Filter,
  Clock,
  Loader2,
  RefreshCw,
  Upload,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Key,
} from "lucide-react";
import { signUp } from "@/service/operations/vendor";
import { getAllCategoriesAPI, purchaseCategoryAPI } from "@/service/operations/category";
import { sendOTP, verifyOTP } from "@/service/operations/otp";
import { imageUpload } from "@/service/operations/image";
import { vendor } from "@/service/apis";
import * as XLSX from "xlsx";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

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
  { id: 7, title: "Work Images", icon: "🖼️" },
  { id: 8, title: "Submit", icon: "✅" },
];

// Import your API functions
import {
  getAllVendorAPI,
  getAllVendorPaginatedAPI,
  updateVendorStatusAPI,
  updateVendorPersentageAPI,
  updateVendorProfileAPI,
  requestForTheUpdateProfileAPI,
  deleteVendorAPI,
} from "@/service/operations/vendor";
import { getVendorPendingCategoryPurchasesAPI, getPurchasedCategoriesAPI } from "@/service/operations/category";
import { updatePropertyStatusAPI, getVendorPropertyAPI, deletePropertyAPI } from "@/service/operations/property";
import { AdminEditServiceModal } from "./AdminEditServiceModal.tsx";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import AllBooking from "./AllBooking";
import VendorProfileMangeByAdmin from "./VendorProfileMangeByAdmin";
import VendorProfileUpdateNotifications from "./VendorProfileUpdateNotifications";
import { useNavigate, Link } from "react-router-dom";
const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [percentages, setPercentages] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorProperties, setVendorProperties] = useState([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    vendor: null,
    action: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    vendor: null,
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState({
    open: false,
    vendor: null,
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCustomPageSize, setShowCustomPageSize] = useState(false);
  const [customPageSizeInput, setCustomPageSizeInput] = useState("");
  const [loading, setLoading] = useState(true);   // full-page spinner — only on initial load
  const [refreshing, setRefreshing] = useState(false); // button spinner — on refresh/search
  const [submitting, setSubmitting] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [deleteServiceModalOpen, setDeleteServiceModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);
  const [editServiceModalOpen, setEditServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any | null>(null);
  const [updatingPercentage, setUpdatingPercentage] = useState({});
  const [vendorPendingPayments, setVendorPendingPayments] = useState<Record<string, boolean>>({});
  const [vendorPurchasedCategories, setVendorPurchasedCategories] = useState<Record<string, boolean>>({});
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const [accepted, setAccepted] = useState(false);
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
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">("bank");
  const [selectedDocumentType, setSelectedDocumentType] = useState<"aadhaar" | "pan" | "gst" | "tradeLicense" | "voterId" | "drivingLicence" | "">("");
  const [voterIdNumber, setVoterIdNumber] = useState("");
  const [drivingLicenceNumber, setDrivingLicenceNumber] = useState("");
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
  const [portfolioImages, setPortfolioImages] = useState<Array<{ public_id: string; url: string }>>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);

  // OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedNumber, setVerifiedNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    company: "",
    typeOfService: "",
    description: "",
    category: "",
    subCategory: "",
    yearOfEstablishment: "",
    name: "",

    // Step 2: Contact Details
    address: "",
    pincode: "",
    serviceLocation: "",
    phone: "",
    alternatePhone: "",
    whatsappNumber: "",
    email: "",

    // Step 3: Business & Legal
    businessType: "Proprietorship",
    gstNumber: "",
    pan: "",
    adhar: "",
    tradeLicense: "",

    // Step 4: Bank Details or UPI
    paymentMethod: "bank",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",

    // Step 5: Experience
    totalYears: "",
    numberOfStaff: "",
    servicesOffered: "",
    workingDays: "",

    // Step 7: Password
    password: "",
    confirmPassword: "",
    referralCode: "",
    referralName: "",

    status: "approved",
  });

  const isCurrentVerified = isPhoneVerified && verifiedNumber === (hasWhatsApp ? formData.whatsappNumber : formData.phone);

  // Fetch vendors using the new paginated API
  const fetchVendors = async (page = currentPage, search = searchTerm, status = statusFilter, limit = itemsPerPage) => {
    const isInitialLoad = vendors.length === 0;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const token = (user as any)?.token;
      const result = await getAllVendorPaginatedAPI({ page, limit, search, status, token });

      if (result && result.vendors) {
        setVendors(result.vendors);
        setCurrentPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setTotalVendors(result.pagination.total);

        // Initialize percentages with existing values
        const initialPercentages = {};
        result.vendors.forEach((vendor) => {
          initialPercentages[vendor._id] = vendor.percentage || "";
        });
        setPercentages(initialPercentages);

        // Load payment status in background (non-blocking)
        checkPendingPayments(result.vendors);
      } else {
        setVendors([]);
        setTotalVendors(0);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  // Check pending payments for all vendors
  const checkPendingPayments = async (vendorsList) => {
    setPaymentStatusLoading(true);

    try {
      const results = await Promise.allSettled(
        vendorsList.map(async (vendor) => {
          try {
            const [pendingPurchases, purchasedCategories] = await Promise.all([
              getVendorPendingCategoryPurchasesAPI(vendor._id),
              getPurchasedCategoriesAPI(vendor._id)
            ]);

            return {
              vendorId: vendor._id,
              hasPending: pendingPurchases && pendingPurchases.length > 0,
              hasPurchased: purchasedCategories && purchasedCategories.length > 0,
            };
          } catch {
            return { vendorId: vendor._id, hasPending: false, hasPurchased: false };
          }
        })
      );

      const pendingMap = {};
      const purchasedMap = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          pendingMap[data.vendorId] = data.hasPending;
          purchasedMap[data.vendorId] = data.hasPurchased;
        }
      });

      // Batch both state updates together to avoid double re-render
      setVendorPendingPayments(pendingMap);
      setVendorPurchasedCategories(purchasedMap);
    } catch {
      setVendorPendingPayments({});
      setVendorPurchasedCategories({});
    } finally {
      setPaymentStatusLoading(false);
    }
  };


  // Initial load only
  useEffect(() => {
    fetchVendors(1, "", statusFilter);
  }, []);

  // Status filter change triggers immediate search (no button needed for dropdown)
  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchVendors(1, searchTerm, newStatus);
  };

  // Search triggered by button click or Enter key
  const handleSearch = () => {
    setCurrentPage(1);
    fetchVendors(1, searchTerm, statusFilter);
  };


  // Fetch categories
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
    setFormData(prev => ({ ...prev, workingDays: `${selectedDays.join(", ")} | ${workingTime}` }));
  }, []);

  // Check verification status when phone/whatsapp numbers change
  useEffect(() => {
    const activeNumber = hasWhatsApp ? formData.whatsappNumber : formData.phone;
    if (activeNumber !== verifiedNumber) {
      setOtpSent(false);
      setOtp('');
    }
  }, [formData.phone, formData.whatsappNumber, hasWhatsApp, verifiedNumber]);

  const handleBusinessDocumentChange = (docKey: keyof typeof businessDocuments, file: File | null) => {
    setBusinessDocuments(prev => ({ ...prev, [docKey]: file }));
  };

  const handlePortfolioImagesChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages = Array.from(files);
    const totalImages = portfolioImages.length + newImages.length;

    if (totalImages > 10) {
      toast({
        title: "Error",
        description: "You can upload maximum 10 business/service images",
        variant: "destructive",
      });
      return;
    }

    setPortfolioUploading(true);
    try {
      const uploadedImages = await imageUpload(newImages);

      if (uploadedImages && uploadedImages.length > 0) {
        const formattedImages = uploadedImages.map((img: any) => ({
          public_id: img.asset_id || img.public_id,
          url: img.url
        }));

        setPortfolioImages(prev => [...prev, ...formattedImages]);
        toast({
          title: "Success",
          description: `${uploadedImages.length} image(s) uploaded successfully!`,
        });
      }
    } catch (error) {
      console.error("Portfolio upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload business/service images",
        variant: "destructive",
      });
    } finally {
      setPortfolioUploading(false);
    }
  };

  const removePortfolioImage = (publicId: string) => {
    setPortfolioImages(prev => prev.filter(img => img.public_id !== publicId));
  };

  const nextStep = () => {
    // Validate Step 1 - Basic Info
    if (currentStep === 1) {
      if (!formData.company || formData.company.trim().length < 2) {
        toast({
          title: "Validation Error",
          description: "Service Provider / Business Name is required (minimum 2 characters)",
          variant: "destructive",
        });
        return;
      }
      if (!formData.typeOfService || formData.typeOfService.trim().length < 2) {
        toast({
          title: "Validation Error",
          description: "Type of service is required (minimum 2 characters)",
          variant: "destructive",
        });
        return;
      }
      if (!formData.description || formData.description.trim().length < 10) {
        toast({
          title: "Validation Error",
          description: "Service description is required (minimum 10 characters)",
          variant: "destructive",
        });
        return;
      }
      if (!formData.category) {
        toast({
          title: "Validation Error",
          description: "Category is required",
          variant: "destructive",
        });
        return;
      }
      if (!formData.subCategory) {
        toast({
          title: "Validation Error",
          description: "Sub-category is required",
          variant: "destructive",
        });
        return;
      }
      if (!formData.name || formData.name.trim().length < 2) {
        toast({
          title: "Validation Error",
          description: "Owner / Authorized Person Name is required (minimum 2 characters)",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate Step 2 - Contact Details
    if (currentStep === 2) {
      if (!formData.address || formData.address.trim().length < 5) {
        toast({
          title: "Validation Error",
          description: "Registered Office / Home Address is required (minimum 5 characters)",
          variant: "destructive",
        });
        return;
      }
      if (!formData.serviceLocation || formData.serviceLocation.trim().length < 2) {
        toast({
          title: "Validation Error",
          description: "Service Location / Area Covered is required (minimum 2 characters)",
          variant: "destructive",
        });
        return;
      }
      if (!formData.phone || !/^[1-9]\d{9}$/.test(formData.phone)) {
        toast({
          title: "Validation Error",
          description: "Primary Contact Number must be a valid 10-digit number",
          variant: "destructive",
        });
        return;
      }
      if (formData.alternatePhone && !/^[1-9]\d{9}$/.test(formData.alternatePhone)) {
        toast({
          title: "Validation Error",
          description: "Alternate Contact Number must be a valid 10-digit number if provided",
          variant: "destructive",
        });
        return;
      }
      if (hasWhatsApp === null) {
        toast({
          title: "Validation Error",
          description: "Please select whether you have WhatsApp or not",
          variant: "destructive",
        });
        return;
      }
      if (hasWhatsApp) {
        if (!formData.whatsappNumber || !/^[1-9]\d{9}$/.test(formData.whatsappNumber)) {
          toast({
            title: "Validation Error",
            description: "WhatsApp Number must be a valid 10-digit number",
            variant: "destructive",
          });
          return;
        }
      }
      // Check OTP verification
      if (!isCurrentVerified) {
        toast({
          title: "Validation Error",
          description: "Please verify the phone number / WhatsApp number with OTP before proceeding",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate Step 3 - Business documents
    if (currentStep === 3) {
      if (!formData.businessType) {
        toast({
          title: "Validation Error",
          description: "Please select your Business Type",
          variant: "destructive",
        });
        return;
      }
      if (!selectedDocumentType) {
        toast({
          title: "Validation Error",
          description: "Please select a document type to upload",
          variant: "destructive",
        });
        return;
      }

      if (selectedDocumentType === "aadhaar") {
        if (!formData.adhar || !/^\d{12}$/.test(formData.adhar)) {
          toast({
            title: "Validation Error",
            description: "Please enter a valid 12-digit Aadhaar number",
            variant: "destructive",
          });
          return;
        }
        if (!businessDocuments.aadhaarFront || !businessDocuments.aadhaarBack) {
          toast({
            title: "Validation Error",
            description: "Please upload both front and back of Aadhaar card",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedDocumentType === "pan") {
        if (!formData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan)) {
          toast({
            title: "Validation Error",
            description: "Please enter a valid PAN number (e.g. ABCDE1234F)",
            variant: "destructive",
          });
          return;
        }
        if (!businessDocuments.panCard) {
          toast({
            title: "Validation Error",
            description: "Please upload PAN card image",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedDocumentType === "gst") {
        if (!formData.gstNumber || !formData.gstNumber.trim()) {
          toast({
            title: "Validation Error",
            description: "Please enter your GST number",
            variant: "destructive",
          });
          return;
        }
        if (!businessDocuments.gstCertificate) {
          toast({
            title: "Validation Error",
            description: "Please upload GST certificate",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedDocumentType === "tradeLicense") {
        if (!formData.tradeLicense || !formData.tradeLicense.trim()) {
          toast({
            title: "Validation Error",
            description: "Please enter your Trade License / Shop Act Registration number",
            variant: "destructive",
          });
          return;
        }
        if (!businessDocuments.tradeLicenseDoc) {
          toast({
            title: "Validation Error",
            description: "Please upload Trade License document",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedDocumentType === "voterId") {
        if (!voterIdNumber || !voterIdNumber.trim()) {
          toast({
            title: "Validation Error",
            description: "Please enter your Voter ID number",
            variant: "destructive",
          });
          return;
        }
        if (!businessDocuments.voterIdFront || !businessDocuments.voterIdBack) {
          toast({
            title: "Validation Error",
            description: "Please upload both front and back of Voter ID card",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedDocumentType === "drivingLicence") {
        if (!drivingLicenceNumber || !drivingLicenceNumber.trim()) {
          toast({
            title: "Validation Error",
            description: "Please enter your Driving Licence number",
            variant: "destructive",
          });
          return;
        }
        if (!businessDocuments.drivingLicenceFront || !businessDocuments.drivingLicenceBack) {
          toast({
            title: "Validation Error",
            description: "Please upload both front and back of Driving Licence",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Validate Step 5 - Experience & working timings
    if (currentStep === 5) {
      const hasAnyWorkingDay = Object.values(workingDays).some(v => v);
      if (!hasAnyWorkingDay) {
        toast({
          title: "Validation Error",
          description: "Please select at least one working day",
          variant: "destructive",
        });
        return;
      }
      if (!workingTime || !workingTime.trim()) {
        toast({
          title: "Validation Error",
          description: "Working timings are required",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // OTP Functions
  const handleSendOTP = async () => {
    const phoneNumber = formData.phone;
    const whatsappNumber = formData.whatsappNumber;

    // Determine which number to verify based on WhatsApp selection
    let numberToVerify;
    let preferredMethod;

    if (hasWhatsApp) {
      numberToVerify = whatsappNumber;
      preferredMethod = 'whatsapp';

      if (!whatsappNumber || whatsappNumber.length !== 10) {
        toast({
          title: "Error",
          description: "Please enter a valid 10-digit WhatsApp number",
          variant: "destructive",
        });
        return;
      }
    } else {
      numberToVerify = phoneNumber;
      preferredMethod = 'sms';

      if (!phoneNumber || phoneNumber.length !== 10) {
        toast({
          title: "Error",
          description: "Please enter a valid 10-digit phone number",
          variant: "destructive",
        });
        return;
      }
    }

    setOtpLoading(true);

    const otpData = {
      phone: numberToVerify,
      preferredMethod: preferredMethod,
      forceResend: true
    };

    if (hasWhatsApp && whatsappNumber) {
      otpData.whatsappNumber = whatsappNumber;
    }

    const result = await sendOTP(otpData);
    setOtpLoading(false);

    if (result.success) {
      setOtpSent(true);
      setIsPhoneVerified(false);
      // Clear the OTP input when resending
      setOtp('');

      toast({
        title: "Success",
        description: hasWhatsApp
          ? `OTP sent to WhatsApp number ${whatsappNumber}`
          : `OTP sent to phone number ${phoneNumber}`,
      });
    }
  };

  const handleVerifyOTP = async () => {
    const phoneNumber = formData.phone;
    const whatsappNumber = formData.whatsappNumber;

    const numberToVerify = hasWhatsApp ? whatsappNumber : phoneNumber;

    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setOtpLoading(true);

    const result = await verifyOTP({
      phone: numberToVerify,
      otp: otp
    });

    setOtpLoading(false);

    if (result.success) {
      setIsPhoneVerified(true);
      setVerifiedNumber(numberToVerify);
      setOtpSent(false);
      setOtp('');

      toast({
        title: "Success",
        description: "Phone number verified successfully!",
      });
    }
  };

  const progress = (currentStep / 8) * 100;

  const handlePercentageChange = (id, value) => {
    setPercentages({
      ...percentages,
      [id]: value,
    });
  };

  const handlePercentageSubmit = async (id, percentage) => {
    if (!percentage || percentage === "") {
      toast({
        title: "Error",
        description: "Please enter a valid percentage",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingPercentage({ ...updatingPercentage, [id]: true });
      const response = await updateVendorPersentageAPI(id, percentage);

      if (response) {
        // Update local state
        setVendors(
          vendors.map((vendor) =>
            vendor._id === id
              ? { ...vendor, percentage: Number.parseInt(percentage) }
              : vendor
          )
        );
        toast({
          title: "Success",
          description: "Percentage updated successfully",
        });
      } else {
        throw new Error("Failed to update percentage");
      }
    } catch (error) {
      console.error("Error updating percentage:", error);
      toast({
        title: "Error",
        description: "Failed to update percentage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPercentage({ ...updatingPercentage, [id]: false });
    }
  };

  const handleRowClick = async (vendor) => {
    setSelectedVendor(vendor);
    setLoadingProperties(true);
    setIsDetailsDialogOpen(true);

    try {
      const response = await getVendorPropertyAPI({ vendor: vendor._id });
      console.log("Properties response:", response);
      setVendorProperties(response || []);
    } catch (error) {
      console.error("Error fetching vendor properties:", error);
      setVendorProperties([]);
      toast({
        title: "Error",
        description: "Failed to load vendor properties",
        variant: "destructive",
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const service = vendorProperties.find(s => s._id === serviceId);
    setServiceToDelete(service);
    setDeleteServiceModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setServiceToEdit(service);
    setEditServiceModalOpen(true);
  };

  const handleSaveService = (updatedService: any) => {
    setVendorProperties(
      vendorProperties.map((s) => (s._id === updatedService._id ? updatedService : s))
    );
  };

  const handleServiceStatusToggle = async (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const result = await updatePropertyStatusAPI(serviceId, newStatus);
      if (result) {
        // Update local state
        setVendorProperties(vendorProperties.map(service =>
          service._id === serviceId
            ? { ...service, status: newStatus }
            : service
        ));
        toast({
          title: "Success",
          description: `Service ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
        });
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete?._id) return;

    setDeletingServiceId(serviceToDelete._id);
    try {
      await deletePropertyAPI(serviceToDelete._id);
      // Remove the deleted service from the local state
      setVendorProperties(vendorProperties.filter(service => service._id !== serviceToDelete._id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      setDeleteServiceModalOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleVendorAction = async (vendorId, action) => {
    try {
      setSubmitting(true);
      const response = await updateVendorStatusAPI(vendorId, action);

      if (response?.success) {
        // Update local state
        setVendors(
          vendors.map((vendor) =>
            vendor._id === vendorId ? { ...vendor, status: action } : vendor
          )
        );
        toast({
          title: "Success",
          description: `Vendor ${action} successfully`,
        });
      } else {
        throw new Error(response?.message || "Failed to update vendor status");
      }
    } catch (error) {
      console.error("Error updating vendor status:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setAlertDialog({ open: false, vendor: null, action: "" });
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      setSubmitting(true);

      // Delete the vendor (this will also delete all their services on the backend)
      await deleteVendorAPI(vendorId);

      // Remove vendor from local state
      setVendors(vendors.filter(v => v._id !== vendorId));

      // Close the delete dialog
      setDeleteDialog({ open: false, vendor: null });

      // If this was the selected vendor, clear the selection
      if (selectedVendor?._id === vendorId) {
        setSelectedVendor(null);
        setVendorProperties([]);
      }

      toast({
        title: "Success",
        description: "Partner and all their services have been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.vendor) return;

    // Validate passwords
    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields",
        variant: "destructive",
      });
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(vendor.ADMIN_RESET_PASSWORD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId: resetPasswordDialog.vendor._id,
          newPassword: resetPasswordData.newPassword,
          confirmPassword: resetPasswordData.confirmPassword,
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      // Try to parse JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error("Invalid response from server. Please check server logs.");
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Vendor password reset successfully",
        });
        setResetPasswordDialog({ open: false, vendor: null });
        setResetPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();

    // Only submit on step 8
    if (currentStep !== 8) {
      return;
    }

    if (!accepted) {
      toast({
        title: "Error",
        description: "Please accept the Terms & Conditions before registering.",
        variant: "destructive",
      });
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    // Validate WhatsApp selection and number
    if (hasWhatsApp === null) {
      toast({
        title: "Error",
        description: "Please select whether you have WhatsApp or not",
        variant: "destructive",
      });
      return;
    }

    if (hasWhatsApp && !formData.whatsappNumber) {
      toast({
        title: "Error",
        description: "Please enter your WhatsApp number",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "company",
      "phone",
      "password",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in all required fields: ${missingFields.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Include category and subCategory in vendor registration data
      const { category, subCategory, ...vendorData } = formData;

      // Create FormData for file uploads
      const submitFormData = new FormData();

      // Add basic form fields (skip fields that will be added separately)
      const fieldsToSkip = ['accountNumber', 'ifscCode', 'accountHolderName', 'bankName', 'totalYears', 'servicesOffered', 'paymentMethod', 'upiId', 'numberOfStaff'];

      Object.entries(vendorData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && !fieldsToSkip.includes(key)) {
          submitFormData.append(key, value.toString());
        }
      });

      // Add category and subCategory
      if (category) submitFormData.append("category", category);
      if (subCategory) submitFormData.append("subCategory", subCategory);

      // Add isAdmin flag
      submitFormData.append("isAdmin", "true");

      // Add numberOfStaff
      const staffCount = vendorData.numberOfStaff ? parseInt(vendorData.numberOfStaff).toString() : "0";
      submitFormData.append("numberOfStaff", staffCount);

      // Payment details - Bank or UPI
      submitFormData.append("paymentMethod", vendorData.paymentMethod);

      if (vendorData.paymentMethod === "bank") {
        if (vendorData.accountNumber) submitFormData.append("bankDetail[accountNumber]", vendorData.accountNumber);
        if (vendorData.ifscCode) submitFormData.append("bankDetail[IFSC]", vendorData.ifscCode);
        if (vendorData.accountHolderName) submitFormData.append("bankDetail[accountHolderName]", vendorData.accountHolderName);
        if (vendorData.bankName) submitFormData.append("bankDetail[branch]", vendorData.bankName);
      } else if (vendorData.paymentMethod === "upi") {
        if (vendorData.upiId) submitFormData.append("upiId", vendorData.upiId);
      }

      // Experience
      if (vendorData.totalYears) {
        submitFormData.append("experience[totalYears]", parseInt(vendorData.totalYears).toString());
      } else {
        submitFormData.append("experience[totalYears]", "0");
      }

      if (vendorData.servicesOffered) {
        const services = vendorData.servicesOffered.split(",").map(s => s.trim());
        services.forEach(service => {
          submitFormData.append("experience[fields]", service);
        });
      }

      // Add profile photo if selected
      if (profilePhoto) {
        submitFormData.append("profilePhoto", profilePhoto);
      }

      // Add business documents in the format backend expects (document1, document2, etc.)
      submitFormData.append("selectedDocumentType", selectedDocumentType);

      if (selectedDocumentType === "aadhaar") {
        if (businessDocuments.aadhaarFront) {
          submitFormData.append("document1", businessDocuments.aadhaarFront);
          console.log("📄 Adding document1 (Aadhaar Front):", businessDocuments.aadhaarFront.name);
        }
        if (businessDocuments.aadhaarBack) {
          submitFormData.append("document2", businessDocuments.aadhaarBack);
          console.log("📄 Adding document2 (Aadhaar Back):", businessDocuments.aadhaarBack.name);
        }
      } else if (selectedDocumentType === "pan") {
        if (businessDocuments.panCard) {
          submitFormData.append("document1", businessDocuments.panCard);
          console.log("📄 Adding document1 (PAN Card):", businessDocuments.panCard.name);
        }
      } else if (selectedDocumentType === "gst") {
        if (businessDocuments.gstCertificate) {
          submitFormData.append("document1", businessDocuments.gstCertificate);
          console.log("📄 Adding document1 (GST Certificate):", businessDocuments.gstCertificate.name);
        }
      } else if (selectedDocumentType === "tradeLicense") {
        if (businessDocuments.tradeLicenseDoc) {
          submitFormData.append("document1", businessDocuments.tradeLicenseDoc);
          console.log("📄 Adding document1 (Trade License):", businessDocuments.tradeLicenseDoc.name);
        }
      } else if (selectedDocumentType === "voterId") {
        if (voterIdNumber) submitFormData.append("voterId", voterIdNumber);
        if (businessDocuments.voterIdFront) {
          submitFormData.append("document1", businessDocuments.voterIdFront);
          console.log("📄 Adding document1 (Voter ID Front):", businessDocuments.voterIdFront.name);
        }
        if (businessDocuments.voterIdBack) {
          submitFormData.append("document2", businessDocuments.voterIdBack);
          console.log("📄 Adding document2 (Voter ID Back):", businessDocuments.voterIdBack.name);
        }
      } else if (selectedDocumentType === "drivingLicence") {
        if (drivingLicenceNumber) submitFormData.append("drivingLicence", drivingLicenceNumber);
        if (businessDocuments.drivingLicenceFront) {
          submitFormData.append("document1", businessDocuments.drivingLicenceFront);
          console.log("📄 Adding document1 (DL Front):", businessDocuments.drivingLicenceFront.name);
        }
        if (businessDocuments.drivingLicenceBack) {
          submitFormData.append("document2", businessDocuments.drivingLicenceBack);
          console.log("📄 Adding document2 (DL Back):", businessDocuments.drivingLicenceBack.name);
        }
      }

      // Add portfolio images URLs (already uploaded to server)
      if (portfolioImages.length > 0) {
        submitFormData.append("portfolioImages", JSON.stringify(portfolioImages));
      }

      const response = await signUp(submitFormData);

      if (response?.success) {
        // Navigate to category purchase page instead of auto-purchasing
        if (selectedCategory && response.user?._id) {
          const params = new URLSearchParams({
            vendorId: response.user._id,
            categoryId: selectedCategory,
            vendorName: formData.name,
            vendorEmail: formData.email || "",
            vendorPhone: formData.phone,
            isAdmin: "true", // Flag for admin registration
          });

          console.log("🔗 Admin navigating to category purchase with params:", {
            vendorId: response.user._id,
            categoryId: selectedCategory,
            vendorName: formData.name,
            vendorEmail: formData.email || "",
            vendorPhone: formData.phone,
            isAdmin: true,
          });

          // Close the dialog first
          setIsAddDialogOpen(false);

          // Navigate to category purchase page
          navigate(`/category-purchase?${params.toString()}`);
        } else {
          console.log("⚠️ No category selected or no user ID, staying on admin page");
          toast({
            title: "Success",
            description: "Vendor registered successfully",
          });

          // Reset form and close dialog
          setIsAddDialogOpen(false);
          await fetchVendors();
        }

        // Reset form data for next registration
        setFormData({
          company: "",
          typeOfService: "",
          description: "",
          category: "",
          subCategory: "",
          yearOfEstablishment: "",
          name: "",
          address: "",
          pincode: "",
          serviceLocation: "",
          phone: "",
          alternatePhone: "",
          whatsappNumber: "",
          email: "",
          businessType: "Proprietorship",
          gstNumber: "",
          pan: "",
          adhar: "",
          tradeLicense: "",
          bankName: "",
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          totalYears: "",
          numberOfStaff: "",
          servicesOffered: "",
          workingDays: "",
          password: "",
          confirmPassword: "",
          referralCode: "",
          referralName: "",
          status: "approved",
        });

        setCurrentStep(1);
        setAccepted(false);
        setSelectedCategory("");
        setSelectedAutoFilled("");
        setSelectedDocumentType("");
        setPortfolioImages([]);
        setProfilePhoto(null);
        setVoterIdNumber("");
        setDrivingLicenceNumber("");
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
      } else {
        throw new Error("Failed to register vendor");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to register vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVendor = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      // Note: You'll need to implement updateVendorAPI in your service
      // Exclude workingHours from the update to prevent "[object Object]" issue
      const { workingHours, ...vendorDataToUpdate } = editingVendor;
      const response = await updateVendorProfileAPI(
        editingVendor._id,
        vendorDataToUpdate
      );

      // For now, just update local state
      setVendors(
        vendors.map((vendor) =>
          vendor._id === editingVendor._id ? editingVendor : vendor
        )
      );

      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingVendor(null);
    } catch (error) {
      console.error("Error editing vendor:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (vendor) => {
    setEditingVendor({ ...vendor });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleDownloadExcel = () => {
    // Prepare comprehensive vendor data for all 7 steps (excluding documents and passwords)
    const excelData = filteredVendors.map((vendor) => ({
      // Step 1: Basic Info
      "Vendor Name": vendor.name || "",
      "Business/Company Name": vendor.company || "",
      "Type of Service": vendor.typeOfService || "",
      "Service Description": vendor.description || "",
      "Category": vendor.category?.name || vendor.category || "",
      "Sub Category": vendor.subCategory || "",
      "Year of Establishment": vendor.yearOfEstablishment || "",

      // Step 2: Contact Details
      "Address": vendor.address || "",
      "Service Location": vendor.serviceLocation || "",
      "Primary Phone": vendor.phone || "",
      "Alternate Phone": vendor.alternatePhone || "",
      "WhatsApp Number": vendor.whatsappNumber || "",
      "Email": vendor.email || "",

      // Step 3: Business & Legal
      "Business Type": vendor.businessType || "",
      "Aadhaar Number": vendor.adhar || "",
      "PAN Number": vendor.pan || "",
      "GST Number": vendor.gstNumber || "",
      "Trade License": vendor.tradeLicense || "",

      // Step 4: Bank Details
      "Bank Name": vendor.bankDetail?.branch || "",
      "Account Holder Name": vendor.bankDetail?.accountHolderName || "",
      "Account Number": vendor.bankDetail?.accountNumber || "",
      "IFSC Code": vendor.bankDetail?.IFSC || "",

      // Step 5: Experience & Staff
      "Years of Experience": vendor.experience?.totalYears || "",
      "Number of Staff": vendor.numberOfStaff || "",
      "Services Offered": (vendor.experience?.fields || []).join(", ") || "",
      "Working Days & Timings": vendor.workingDaysTimings || "",

      // Step 7: Additional Info (excluding password)
      "Referral Code": vendor.referralCode || "",
      "Referral Name": vendor.referralName || "",

      // System Info
      "Status": vendor.status || "",
      "Commission %": vendor.percentage || "",
      "Registration Date": vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "",
      "Last Updated": vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : "",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Vendor Name
      { wch: 25 }, // Business Name
      { wch: 20 }, // Type of Service
      { wch: 30 }, // Description
      { wch: 20 }, // Category
      { wch: 20 }, // Sub Category
      { wch: 15 }, // Year
      { wch: 30 }, // Address
      { wch: 20 }, // Service Location
      { wch: 15 }, // Primary Phone
      { wch: 15 }, // Alternate Phone
      { wch: 15 }, // WhatsApp
      { wch: 25 }, // Email
      { wch: 15 }, // Business Type
      { wch: 15 }, // Aadhaar
      { wch: 12 }, // PAN
      { wch: 18 }, // GST
      { wch: 20 }, // Trade License
      { wch: 20 }, // Bank Name
      { wch: 20 }, // Account Holder
      { wch: 18 }, // Account Number
      { wch: 12 }, // IFSC
      { wch: 10 }, // Experience
      { wch: 10 }, // Staff
      { wch: 30 }, // Services Offered
      { wch: 25 }, // Working Days
      { wch: 15 }, // Referral Code
      { wch: 20 }, // Referral Name
      { wch: 12 }, // Status
      { wch: 12 }, // Commission
      { wch: 15 }, // Registration Date
      { wch: 15 }, // Last Updated
    ];

    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Vendors_Complete_Details_${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, filename);
  };
  const filteredVendors = vendors; // server-side filtered


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (!user?.isVendor) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-1 sm:px-4 py-4 md:p-6 space-y-6 min-h-screen flex flex-col font-inter overflow-x-hidden">
      {/* Profile Update Notifications */}
      <VendorProfileUpdateNotifications />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="textsm md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            Partner Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage partner applications and approvals
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FileText className="w-4 h-4" />
            Download Excel
          </button>
          <Button
            variant="outline"
            onClick={() => fetchVendors(currentPage, searchTerm, statusFilter)}
            disabled={refreshing || loading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Add New Partner - Step {currentStep} of 8
                </DialogTitle>
                <DialogDescription>
                  Register a new vendor to list their properties
                </DialogDescription>
              </DialogHeader>

              {/* Progress Bar */}
              <div className="mb-4">
                <Progress value={progress} className="h-2 mb-4" />
                <div className="flex justify-between overflow-x-auto pb-2">
                  {STEPS.map((step) => (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center min-w-[60px] cursor-pointer ${currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                        }`}
                      onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 ${currentStep > step.id
                          ? "bg-green-500 text-white"
                          : currentStep === step.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                          }`}
                      >
                        {currentStep > step.id ? <Check size={16} /> : step.icon}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Service Provider / Business Name <span className="text-red-500">*</span></Label>
                        <Input
                          name="company"
                          placeholder="Enter business name"
                          value={formData.company}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type of Service <span className="text-red-500">*</span></Label>
                        <Input
                          name="typeOfService"
                          placeholder="e.g., Plumbing, Electrical"
                          value={formData.typeOfService}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Service Description <span className="text-red-500">*</span></Label>
                      <Textarea
                        name="description"
                        placeholder="Describe your services in detail"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Category (Service) <span className="text-red-500">*</span>
                        </Label>

                        <Select
                          value={selectedCategory}
                          onValueChange={(val) => {
                            setSelectedCategory(val);
                            setFormData((prev) => ({ ...prev, category: val }));

                            const selectedCat = categories.find((c) => c._id === val);

                            if (selectedCat?.autoFilled) {
                              setSelectedAutoFilled(selectedCat.autoFilled);
                              setFormData((prev) => ({
                                ...prev,
                                subCategory: selectedCat.autoFilled,
                              }));
                            } else {
                              setSelectedAutoFilled("");
                              setFormData((prev) => ({ ...prev, subCategory: "" }));
                            }
                          }}
                        >
                          <SelectTrigger className="h-10 text-sm overflow-hidden">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>

                          <SelectContent className="max-h-60 overflow-y-auto">
                            {categories.map((cat) => (
                              <SelectItem
                                key={cat._id}
                                value={cat._id}
                                className="text-sm"
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Sub Category (Auto Filled){" "}
                          <span className="text-red-500">*</span>
                        </Label>

                        <Input
                          placeholder="Auto-filled based on category"
                          value={selectedAutoFilled}
                          onChange={(e) => {
                            setSelectedAutoFilled(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              subCategory: e.target.value,
                            }));
                          }}
                          className="bg-gray-50 h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Year of Establishment</Label>
                        <Input
                          name="yearOfEstablishment"
                          placeholder="e.g., 2020"
                          value={formData.yearOfEstablishment}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Owner / Authorized Person Name <span className="text-red-500">*</span></Label>
                        <Input
                          name="name"
                          placeholder="Enter owner name"
                          value={formData.name}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Registered Office / Home Address <span className="text-red-500">*</span></Label>
                      <Textarea
                        name="address"
                        placeholder="Enter complete address"
                        value={formData.address}
                        onChange={handleFormChange}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input
                          name="pincode"
                          placeholder="Enter 6-digit pincode"
                          value={formData.pincode}
                          onChange={handleFormChange}
                          maxLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Service Location / Area Covered <span className="text-red-500">*</span></Label>
                        <LocationAutocomplete
                          value={formData.serviceLocation || ""}
                          onChange={(value) => {
                            const event = {
                              target: {
                                name: "serviceLocation",
                                value: value
                              }
                            };
                            handleFormChange(event as any);
                          }}
                          placeholder="Search location (e.g., Sagar, Bhopal, All MP)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Contact Number <span className="text-red-500">*</span>
                          {hasWhatsApp === false && isCurrentVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            name="phone"
                            placeholder="10-digit number"
                            value={formData.phone}
                            onChange={handleFormChange}
                            className={hasWhatsApp === false && isCurrentVerified ? "bg-green-50 border-green-200" : ""}
                          />
                          {hasWhatsApp === false && (
                            <Button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading || !formData.phone || formData.phone.length !== 10}
                              variant="outline"
                            >
                              {otpLoading ? "Sending..." : isCurrentVerified ? "Resend" : "Verify"}
                            </Button>
                          )}
                        </div>
                        {hasWhatsApp === false && isCurrentVerified && (
                          <p className="text-xs text-green-600">Phone number verified! ✓</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Alternate Contact Number</Label>
                        <Input
                          name="alternatePhone"
                          placeholder="10-digit number (optional)"
                          value={formData.alternatePhone}
                          onChange={handleFormChange}
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
                              setFormData(prev => ({ ...prev, whatsappNumber: "" }));
                            }
                          }}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="admin-whatsapp-yes" />
                            <Label htmlFor="admin-whatsapp-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="admin-whatsapp-no" />
                            <Label htmlFor="admin-whatsapp-no" className="cursor-pointer">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {hasWhatsApp && (
                        <div className="space-y-2">
                          <Label>WhatsApp Number <span className="text-red-500">*</span>
                            {isCurrentVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              name="whatsappNumber"
                              placeholder="10-digit WhatsApp number"
                              value={formData.whatsappNumber}
                              onChange={handleFormChange}
                              className={isCurrentVerified ? "bg-green-50 border-green-200" : ""}
                            />
                            <Button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading || !formData.whatsappNumber || formData.whatsappNumber.length !== 10}
                              variant="outline"
                            >
                              {otpLoading ? "Sending..." : isCurrentVerified ? "Resend" : "Verify"}
                            </Button>
                          </div>
                          {isCurrentVerified && (
                            <p className="text-xs text-green-600">WhatsApp number verified! ✓</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* OTP Verification Section */}
                    {otpSent && !isCurrentVerified && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <div className="text-center">
                          <p className="text-blue-800 font-medium">
                            OTP sent to your {hasWhatsApp ? 'WhatsApp' : 'phone'}:
                            <span className="font-bold"> {hasWhatsApp ? formData.whatsappNumber : formData.phone}</span>
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
                        <Input
                          name="email"
                          type="email"
                          placeholder="email@example.com (optional)"
                          value={formData.email}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    {/* OTP Verification Warning */}
                    {!isCurrentVerified && (
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
                              Please verify the {hasWhatsApp ? 'WhatsApp number' : 'phone number'} with OTP before proceeding to the next step.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isCurrentVerified && (
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
                        value={formData.businessType}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, businessType: val }))}
                        className="grid grid-cols-2 md:grid-cols-3 gap-3"
                      >
                        {["Proprietorship", "Partnership", "LLP", "Private Limited", "Other"].map((type) => (
                          <div key={type} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                            <RadioGroupItem value={type} id={`admin-${type}`} />
                            <Label htmlFor={`admin-${type}`} className="cursor-pointer">{type}</Label>
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
                            <SelectItem value="voterId">Voter ID Card (Front & Back)</SelectItem>
                            <SelectItem value="drivingLicence">Driving Licence (Front & Back)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Conditional File Upload based on Document Type */}
                      {selectedDocumentType === "aadhaar" && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                            📸 Please upload both front and back images of Aadhaar card
                          </p>

                          {/* Aadhaar Number Input */}
                          <div className="space-y-2">
                            <Label>Aadhaar Number <span className="text-red-500">*</span></Label>
                            <Input
                              name="adhar"
                              placeholder="Enter 12-digit Aadhaar number"
                              value={formData.adhar}
                              onChange={handleFormChange}
                              maxLength={12}
                            />
                          </div>

                          {/* Aadhaar Front */}
                          <div className="space-y-2">
                            <Label>Aadhaar Card - Front Side <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.aadhaarFront ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
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
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.aadhaarBack ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
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
                            <Label>PAN Number <span className="text-red-500">*</span></Label>
                            <Input
                              name="pan"
                              placeholder="Enter 10-character PAN (e.g. ABCDE1234F)"
                              value={formData.pan}
                              onChange={handleFormChange}
                              className="uppercase"
                              maxLength={10}
                            />
                          </div>

                          {/* PAN Card Upload */}
                          <Label>PAN Card <span className="text-red-500">*</span></Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.panCard ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
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
                            <Label>GST Number <span className="text-red-500">*</span></Label>
                            <Input
                              name="gstNumber"
                              placeholder="Enter GST number"
                              value={formData.gstNumber}
                              onChange={handleFormChange}
                            />
                          </div>

                          {/* GST Certificate Upload */}
                          <Label>GST Certificate <span className="text-red-500">*</span></Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.gstCertificate ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
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
                            <Label>Trade License / Shop Act Registration No. <span className="text-red-500">*</span></Label>
                            <Input
                              name="tradeLicense"
                              placeholder="Enter license number"
                              value={formData.tradeLicense}
                              onChange={handleFormChange}
                            />
                          </div>

                          {/* Trade License Upload */}
                          <Label>Trade License <span className="text-red-500">*</span></Label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.tradeLicenseDoc ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
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

                      {/* Voter ID */}
                      {selectedDocumentType === "voterId" && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                            📸 Please upload both front and back images of Voter ID card
                          </p>
                          <div className="space-y-2">
                            <Label>Voter ID Number <span className="text-red-500">*</span></Label>
                            <Input
                              value={voterIdNumber}
                              onChange={(e) => setVoterIdNumber(e.target.value.toUpperCase())}
                              placeholder="Enter Voter ID number (e.g., ABC1234567)"
                            />
                          </div>
                          {/* Voter ID Front */}
                          <div className="space-y-2">
                            <Label>Voter ID - Front Side <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.voterIdFront ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                                  }`}>
                                  {businessDocuments.voterIdFront ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">{businessDocuments.voterIdFront.name}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload Voter ID Front</span>
                                    </div>
                                  )}
                                </div>
                                <input type="file" className="hidden" accept="image/*,.pdf"
                                  onChange={(e) => handleBusinessDocumentChange('voterIdFront', e.target.files?.[0] || null)} />
                              </label>
                              {businessDocuments.voterIdFront && (
                                <Button type="button" variant="outline" size="icon"
                                  onClick={() => handleBusinessDocumentChange('voterIdFront', null)}><X size={16} /></Button>
                              )}
                            </div>
                          </div>
                          {/* Voter ID Back */}
                          <div className="space-y-2">
                            <Label>Voter ID - Back Side <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.voterIdBack ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                                  }`}>
                                  {businessDocuments.voterIdBack ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">{businessDocuments.voterIdBack.name}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload Voter ID Back</span>
                                    </div>
                                  )}
                                </div>
                                <input type="file" className="hidden" accept="image/*,.pdf"
                                  onChange={(e) => handleBusinessDocumentChange('voterIdBack', e.target.files?.[0] || null)} />
                              </label>
                              {businessDocuments.voterIdBack && (
                                <Button type="button" variant="outline" size="icon"
                                  onClick={() => handleBusinessDocumentChange('voterIdBack', null)}><X size={16} /></Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Driving Licence */}
                      {selectedDocumentType === "drivingLicence" && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                            📸 Please upload both front and back images of Driving Licence
                          </p>
                          <div className="space-y-2">
                            <Label>Driving Licence Number <span className="text-red-500">*</span></Label>
                            <Input
                              value={drivingLicenceNumber}
                              onChange={(e) => setDrivingLicenceNumber(e.target.value.toUpperCase())}
                              placeholder="e.g., MP07-2020-0012345"
                            />
                          </div>
                          {/* DL Front */}
                          <div className="space-y-2">
                            <Label>Driving Licence - Front Side <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.drivingLicenceFront ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                                  }`}>
                                  {businessDocuments.drivingLicenceFront ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">{businessDocuments.drivingLicenceFront.name}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload DL Front</span>
                                    </div>
                                  )}
                                </div>
                                <input type="file" className="hidden" accept="image/*,.pdf"
                                  onChange={(e) => handleBusinessDocumentChange('drivingLicenceFront', e.target.files?.[0] || null)} />
                              </label>
                              {businessDocuments.drivingLicenceFront && (
                                <Button type="button" variant="outline" size="icon"
                                  onClick={() => handleBusinessDocumentChange('drivingLicenceFront', null)}><X size={16} /></Button>
                              )}
                            </div>
                          </div>
                          {/* DL Back */}
                          <div className="space-y-2">
                            <Label>Driving Licence - Back Side <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 cursor-pointer">
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors ${!businessDocuments.drivingLicenceBack ? 'border-gray-300 bg-white' : 'border-green-500 bg-green-50'
                                  }`}>
                                  {businessDocuments.drivingLicenceBack ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <Check size={20} />
                                      <span className="truncate max-w-[200px]">{businessDocuments.drivingLicenceBack.name}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                      <Upload size={20} />
                                      <span>Upload DL Back</span>
                                    </div>
                                  )}
                                </div>
                                <input type="file" className="hidden" accept="image/*,.pdf"
                                  onChange={(e) => handleBusinessDocumentChange('drivingLicenceBack', e.target.files?.[0] || null)} />
                              </label>
                              {businessDocuments.drivingLicenceBack && (
                                <Button type="button" variant="outline" size="icon"
                                  onClick={() => handleBusinessDocumentChange('drivingLicenceBack', null)}><X size={16} /></Button>
                              )}
                            </div>
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

                {/* Step 4: Bank Details */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                      💡 Payment details are optional but recommended for faster payment processing.
                    </p>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <Label>Select Payment Method</Label>
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(val) => {
                          setFormData({ ...formData, paymentMethod: val });
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 flex-1">
                          <RadioGroupItem value="bank" id="admin-payment-bank" />
                          <Label htmlFor="admin-payment-bank" className="cursor-pointer flex-1">
                            <div className="font-semibold">Bank Account</div>
                            <div className="text-xs text-gray-500">Enter bank details</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 flex-1">
                          <RadioGroupItem value="upi" id="admin-payment-upi" />
                          <Label htmlFor="admin-payment-upi" className="cursor-pointer flex-1">
                            <div className="font-semibold">UPI ID</div>
                            <div className="text-xs text-gray-500">Enter UPI ID</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Bank Details Fields */}
                    {formData.paymentMethod === "bank" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                              name="bankName"
                              placeholder="Enter bank name"
                              value={formData.bankName}
                              onChange={handleFormChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Account Holder Name</Label>
                            <Input
                              name="accountHolderName"
                              placeholder="Name as per bank account"
                              value={formData.accountHolderName}
                              onChange={handleFormChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                              name="accountNumber"
                              placeholder="Enter account number"
                              value={formData.accountNumber}
                              onChange={handleFormChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>IFSC Code</Label>
                            <Input
                              name="ifscCode"
                              placeholder="Enter IFSC code"
                              value={formData.ifscCode}
                              onChange={handleFormChange}
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
                          name="upiId"
                          placeholder="Enter UPI ID (e.g., yourname@paytm, 9876543210@ybl)"
                          value={formData.upiId}
                          onChange={handleFormChange}
                        />
                        <p className="text-xs text-gray-500">
                          💡 Enter UPI ID from any UPI app (PhonePe, Google Pay, Paytm, etc.)
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
                          name="totalYears"
                          type="number"
                          placeholder="e.g., 5"
                          value={formData.totalYears}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Number of Technicians / Staff</Label>
                        <Input
                          name="numberOfStaff"
                          type="number"
                          placeholder="e.g., 3"
                          value={formData.numberOfStaff}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Services Offered (comma separated)</Label>
                      <Textarea
                        name="servicesOffered"
                        placeholder="e.g., AC Repair, AC Installation, AC Service"
                        value={formData.servicesOffered}
                        onChange={handleFormChange}
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
                            className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${workingDays[day.key as keyof typeof workingDays]
                              ? "bg-blue-100 border-blue-500 text-blue-700"
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
                                setFormData(prev => ({ ...prev, workingDays: `${selectedDays.join(", ")} | ${workingTime}` }));
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{day.label}</span>
                            {workingDays[day.key as keyof typeof workingDays] && (
                              <Check size={14} className="text-blue-600" />
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
                          setFormData(prev => ({ ...prev, workingDays: `${selectedDays.join(", ")} | ${e.target.value}` }));
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
                      📸 Upload vendor's profile photo (optional but recommended). This will be displayed on their vendor profile.
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


                  </div>
                )}

                {/* Step 7: Declaration & Submit */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 bg-purple-50 p-3 rounded-lg border border-purple-200">
                      🖼️ Upload vendor's business/service images (optional but recommended). You can upload up to 10 images showcasing their previous work.
                    </p>

                    {/* Business/Service Images Upload */}
                    <div className="space-y-3">
                      <Label className="text-purple-800 font-semibold">
                        Business/Service Images (Max 10)
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
                                {portfolioUploading ? "Uploading..." : "Click to upload business/service images"}
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

                      {/* Business/Service Images Preview Grid */}
                      {portfolioImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {portfolioImages.map((image, index) => (
                            <div key={image.public_id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                  src={image.url}
                                  alt={`Work Image ${index + 1}`}
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
                          <p className="text-sm">No images uploaded yet</p>
                          <p className="text-xs mt-1">Upload images to showcase vendor's work</p>
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
                        <Input
                          name="password"
                          type="password"
                          placeholder="Create password"
                          value={formData.password}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password <span className="text-red-500">*</span></Label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Referral Code (optional)</Label>
                        <Input
                          name="referralCode"
                          placeholder="Enter referral code if any"
                          value={formData.referralCode}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Referral Name (optional)</Label>
                        <Input
                          name="referralName"
                          placeholder="Enter referral name if any"
                          value={formData.referralName}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <h4 className="font-semibold text-gray-800">Declaration & Undertaking</h4>
                      <p className="text-sm text-gray-600">
                        I, <span className="font-semibold text-gray-800">{formData.company || "_______________"}</span>, hereby declare that the information provided above is true, correct, and complete.
                        I understand that Niyati Solutions reserves the right to verify the details and take
                        necessary action, including suspension or removal of listing, in case of false information.
                      </p>
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the{" "}
                        <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">
                          Terms & Conditions
                        </Link>
                        {" "}and{" "}
                        <Link to="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>
                  )}

                  <div className="flex-1" />

                  {currentStep < 8 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleAddVendor}
                      disabled={submitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Register Partner
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setCurrentStep(1);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search partners by name, email, company, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 pr-4"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={refreshing || loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                  fetchVendors(1, "", "all");
                }}
                disabled={refreshing || loading}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-300"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="w-full shadow-sm overflow-hidden mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            All Partners ({totalVendors} total, showing {vendors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No vendors found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search criteria</p>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative">
              {/* Loading overlay spinner - fixed to viewport center */}
              {refreshing && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm text-gray-600 font-medium">Loading vendors...</p>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Commission %</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow
                      key={vendor._id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleRowClick(vendor)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {vendor.name?.charAt(0) || "V"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {vendor.name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {vendor.email}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              {vendor.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {vendor.company}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.category?.name || vendor.category || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vendor.subCategory || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(vendor.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {paymentStatusLoading ? (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Loading...
                          </Badge>
                        ) : vendorPendingPayments[vendor._id] ? (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Payment Pending
                          </Badge>
                        ) : vendorPurchasedCategories[vendor._id] ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            <X className="w-3 h-3 mr-1" />
                            No Purchase
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <IdCard className="w-3 h-3" />
                            <span className="text-gray-600">Aadhar:</span>
                            <span
                              className={
                                vendor?.adhar
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {vendor?.adhar ? "✓" : "✗"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <CreditCard className="w-3 h-3" />
                            <span className="text-gray-600">PAN:</span>
                            <span
                              className={
                                vendor?.pan ? "text-green-600" : "text-red-600"
                              }
                            >
                              {vendor?.pan ? "✓" : "✗"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={percentages[vendor._id] || ""}
                              onChange={(e) =>
                                handlePercentageChange(
                                  vendor._id,
                                  e.target.value
                                )
                              }
                              className="w-20 pl-7 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePercentageSubmit(
                                vendor._id,
                                percentages[vendor._id]
                              );
                            }}
                            disabled={updatingPercentage[vendor._id]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updatingPercentage[vendor._id] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(vendor.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRowClick(vendor)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(vendor)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Partner
                            </DropdownMenuItem>
                            {vendor.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setAlertDialog({
                                      open: true,
                                      vendor,
                                      action: "approved",
                                    })
                                  }
                                  className="text-green-600"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setAlertDialog({
                                      open: true,
                                      vendor,
                                      action: "rejected",
                                    })
                                  }
                                  className="text-red-600"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {vendor.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setAlertDialog({
                                    open: true,
                                    vendor,
                                    action: "rejected",
                                  })
                                }
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Revoke Access
                              </DropdownMenuItem>
                            )}
                            {vendor.status === "rejected" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setAlertDialog({
                                    open: true,
                                    vendor,
                                    action: "approved",
                                  })
                                }
                                className="text-green-600"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                setResetPasswordDialog({
                                  open: true,
                                  vendor,
                                })
                              }
                              className="text-blue-600"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  vendor,
                                })
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Partner
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
              {/* Left: Page info */}
              <p className="text-sm text-gray-500 whitespace-nowrap order-2 sm:order-1">
                Page {currentPage} of {totalPages} &bull; {totalVendors} total vendors
              </p>

              {/* Center: Page navigation */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      fetchVendors(newPage, searchTerm, statusFilter);
                    }}
                    disabled={currentPage <= 1 || loading}
                    className="h-8 px-2.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>

                  {/* Page number buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            fetchVendors(pageNum, searchTerm, statusFilter);
                          }}
                          disabled={loading}
                          className="w-8 h-8 p-0 text-xs"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      fetchVendors(newPage, searchTerm, statusFilter);
                    }}
                    disabled={currentPage >= totalPages || loading}
                    className="h-8 px-2.5"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Right: Rows per page dropdown */}
              <div className="flex items-center gap-2 order-3">
                <span className="text-sm text-gray-500 whitespace-nowrap">Rows per page:</span>
                <Select
                  value={showCustomPageSize ? "custom" : (itemsPerPage >= 99999 ? "all" : String(itemsPerPage))}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setShowCustomPageSize(true);
                    } else if (value === "all") {
                      setShowCustomPageSize(false);
                      setCustomPageSizeInput("");
                      setItemsPerPage(99999);
                      setCurrentPage(1);
                      fetchVendors(1, searchTerm, statusFilter, 99999);
                    } else {
                      setShowCustomPageSize(false);
                      setCustomPageSizeInput("");
                      const size = parseInt(value);
                      if (itemsPerPage !== size) {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                        fetchVendors(1, searchTerm, statusFilter, size);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-[90px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {showCustomPageSize && (
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      placeholder="e.g. 25"
                      value={customPageSizeInput}
                      onChange={(e) => setCustomPageSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt(customPageSizeInput);
                          if (val && val > 0 && val <= 500) {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                            setShowCustomPageSize(false);
                            fetchVendors(1, searchTerm, statusFilter, val);
                          }
                        }
                      }}
                      className="h-8 w-20 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        const val = parseInt(customPageSizeInput);
                        if (val && val > 0 && val <= 500) {
                          setItemsPerPage(val);
                          setCurrentPage(1);
                          setShowCustomPageSize(false);
                          fetchVendors(1, searchTerm, statusFilter, val);
                        }
                      }}
                    >
                      Go
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Partner Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the vendor and their services
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-6">
              {/* Vendor Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Business Name:</span>
                      <span>{selectedVendor.company || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Owner Name:</span>
                      <span>{selectedVendor.name || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type of Service:</span>
                      <span>{selectedVendor.typeOfService || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Category:</span>
                      <span>{selectedVendor?.category?.name || selectedVendor?.subCategory || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Year Established:</span>
                      <span>{selectedVendor.yearOfEstablishment || "Not Added"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Description:</span>
                      <span className="text-sm">{selectedVendor.description || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(selectedVendor.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Registered:</span>
                      <span>
                        {new Date(
                          selectedVendor.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="font-medium">Address:</span>
                      <span className="text-sm">{selectedVendor.address || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Service Location:</span>
                      <span>{selectedVendor.serviceLocation || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Primary Phone:</span>
                      <span>{selectedVendor.phone || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Alternate Phone:</span>
                      <span>{selectedVendor.alternatePhone || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">WhatsApp:</span>
                      <span>{selectedVendor.whatsappNumber || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedVendor.email || "Not Added"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Business & Legal Information Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      Business & Legal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Business Type:</span>
                      <span>{selectedVendor.businessType || "Proprietorship"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Aadhaar Number:</span>
                      <span>{selectedVendor.adhar || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">PAN Number:</span>
                      <span>{selectedVendor.pan || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Voter ID:</span>
                      <span>{selectedVendor.voterId || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Driving Licence:</span>
                      <span>{selectedVendor.drivingLicence || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">GST Number:</span>
                      <span>{selectedVendor.gstNumber || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Trade License:</span>
                      <span>{selectedVendor.tradeLicense || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Admin Commission:</span>
                      <span>{selectedVendor.percentage ? `${selectedVendor.percentage}%` : "Not Set"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Details Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Payment Method */}
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Payment Method:</span>
                      <span className="capitalize">{selectedVendor.paymentMethod || "Bank"}</span>
                    </div>

                    {/* Bank Details */}
                    {(!selectedVendor.paymentMethod || selectedVendor.paymentMethod === "bank") && (
                      <>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Bank Name:</span>
                          <span>{selectedVendor.bankDetail?.branch || "Not Added"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Account Holder:</span>
                          <span>{selectedVendor.bankDetail?.accountHolderName || "Not Added"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Account Number:</span>
                          <span>{selectedVendor.bankDetail?.accountNumber || "Not Added"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">IFSC Code:</span>
                          <span>{selectedVendor.bankDetail?.IFSC || "Not Added"}</span>
                        </div>
                      </>
                    )}

                    {/* UPI Details */}
                    {selectedVendor.paymentMethod === "upi" && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">UPI ID:</span>
                        <span>{selectedVendor.upiId || "Not Added"}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Experience & Staff Information Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      Experience & Staff Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Experience:</span>
                      <span>{selectedVendor.experience?.totalYears ? `${selectedVendor.experience.totalYears} Years` : "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Staff Count:</span>
                      <span>{selectedVendor.numberOfStaff || "Not Added"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="font-medium">Services Offered:</span>
                      <span className="text-sm">{selectedVendor.experience?.fields?.length > 0 ? selectedVendor.experience.fields.join(", ") : "Not Added"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="font-medium">Working Days & Hours:</span>
                      <span className="text-sm">{selectedVendor.workingDaysTimings || "Not Added"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents & Referral Information Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      Documents & Referral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <span className="font-medium">Documents:</span>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {selectedVendor.profilePhoto && typeof selectedVendor.profilePhoto === 'string' && (
                          <a
                            href={selectedVendor.profilePhoto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            Profile Photo
                          </a>
                        )}
                        {[1, 2, 3, 4, 5].map((num) => {
                          const docField = `document${num}` as keyof typeof selectedVendor;
                          const doc = selectedVendor[docField];
                          return doc && typeof doc === 'string' ? (
                            <a
                              key={num}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              Document {num}
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Referral Code:</span>
                      <span>{selectedVendor.referralCode || "Not Added"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Referral Name:</span>
                      <span>{selectedVendor.referralName || "Not Added"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Properties Section */}
              <Card>
                <CardHeader className="relative">
                  {/* Left Side - Title */}
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Services ({vendorProperties.length})
                    {loadingProperties && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </CardTitle>

                  {/* Right Side - Button */}
                  <button
                    onClick={() =>
                      navigate(`/admin/add-service/${selectedVendor._id}`)
                    }
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                  >
                    Add Services
                  </button>
                </CardHeader>

                <CardContent>
                  {loadingProperties ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">Loading services...</p>
                    </div>
                  ) : vendorProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vendorProperties.map((property) => (
                        <Card key={property._id} className="overflow-hidden">
                          <div className="aspect-video relative">
                            <img
                              src={
                                property?.images?.[0]?.url ||
                                "/placeholder.svg?height=200&width=300"
                              }
                              alt={property?.title || "Property image"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-lg mb-2">
                              {property?.title}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span>{property.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{property.location}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  className={`${property.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                  {property.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between gap-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditService(property)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={property.status === 'active' ? 'destructive' : 'default'}
                                  onClick={() => handleServiceStatusToggle(property._id, property.status || 'active')}
                                  className={property.status === 'active' ? '' : 'bg-green-600 hover:bg-green-700'}
                                >
                                  {property.status === 'active' ? (
                                    <XCircle className="w-3 h-3" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <button
                                onClick={() => handleDeleteService(property._id)}
                                disabled={deletingServiceId === property._id}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {deletingServiceId === property._id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </>
                                )}
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No Service found for this Partner.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <AllBooking user={selectedVendor} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Partner
            </DialogTitle>
            <DialogDescription>Update partner information</DialogDescription>
          </DialogHeader>
          {editingVendor && (
            <VendorProfileMangeByAdmin user={editingVendor} />
            // <form onSubmit={handleEditVendor} className="space-y-4 mt-4">
            //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            //     <div className="space-y-2">
            //       <Label
            //         htmlFor="edit-name"
            //         className="flex items-center gap-2"
            //       >
            //         <User className="w-4 h-4" />
            //         Full Name
            //       </Label>
            //       <Input
            //         id="edit-name"
            //         value={editingVendor.name}
            //         onChange={(e) =>
            //           setEditingVendor({
            //             ...editingVendor,
            //             name: e.target.value,
            //           })
            //         }
            //         required
            //       />
            //     </div>
            //     <div className="space-y-2">
            //       <Label
            //         htmlFor="edit-email"
            //         className="flex items-center gap-2"
            //       >
            //         <Mail className="w-4 h-4" />
            //         Email
            //       </Label>
            //       <Input
            //         id="edit-email"
            //         type="email"
            //         value={editingVendor.email}
            //         onChange={(e) =>
            //           setEditingVendor({
            //             ...editingVendor,
            //             email: e.target.value,
            //           })
            //         }
            //         required
            //       />
            //     </div>
            //   </div>

            //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            //     <div className="space-y-2">
            //       <Label
            //         htmlFor="edit-phone"
            //         className="flex items-center gap-2"
            //       >
            //         <Phone className="w-4 h-4" />
            //         Phone Number
            //       </Label>
            //       <Input
            //         id="edit-phone"
            //         value={editingVendor.phone}
            //         onChange={(e) =>
            //           setEditingVendor({
            //             ...editingVendor,
            //             phone: e.target.value,
            //           })
            //         }
            //         required
            //       />
            //     </div>
            //     <div className="space-y-2">
            //       <Label
            //         htmlFor="edit-company"
            //         className="flex items-center gap-2"
            //       >
            //         <Building2 className="w-4 h-4" />
            //         Company
            //       </Label>
            //       <Input
            //         id="edit-company"
            //         value={editingVendor.company}
            //         onChange={(e) =>
            //           setEditingVendor({
            //             ...editingVendor,
            //             company: e.target.value,
            //           })
            //         }
            //         required
            //       />
            //     </div>
            //   </div>

            //   <div className="space-y-2">
            //     <Label
            //       htmlFor="edit-address"
            //       className="flex items-center gap-2"
            //     >
            //       <MapPin className="w-4 h-4" />
            //       Address
            //     </Label>
            //     <Input
            //       id="edit-address"
            //       value={editingVendor.address}
            //       onChange={(e) =>
            //         setEditingVendor({
            //           ...editingVendor,
            //           address: e.target.value,
            //         })
            //       }
            //       required
            //     />
            //   </div>

            //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            //     <div className="space-y-2">
            //       <Label
            //         htmlFor="edit-adhar"
            //         className="flex items-center gap-2"
            //       >
            //         <IdCard className="w-4 h-4" />
            //         Aadhar Number
            //       </Label>
            //       <Input
            //         id="edit-adhar"
            //         value={editingVendor.adhar}
            //         onChange={(e) =>
            //           setEditingVendor({
            //             ...editingVendor,
            //             adhar: e.target.value,
            //           })
            //         }
            //       />
            //     </div>
            //     <div className="space-y-2">
            //       <Label htmlFor="edit-pan" className="flex items-center gap-2">
            //         <CreditCard className="w-4 h-4" />
            //         PAN Number
            //       </Label>
            //       <Input
            //         id="edit-pan"
            //         value={editingVendor.pan}
            //         onChange={(e) =>
            //           setEditingVendor({
            //             ...editingVendor,
            //             pan: e.target.value,
            //           })
            //         }
            //       />
            //     </div>
            //   </div>

            //   <div className="space-y-2">
            //     <Label htmlFor="edit-description">Description</Label>
            //     <Textarea
            //       id="edit-description"
            //       value={editingVendor.description}
            //       onChange={(e) =>
            //         setEditingVendor({
            //           ...editingVendor,
            //           description: e.target.value,
            //         })
            //       }
            //       rows={3}
            //     />
            //   </div>

            //   <div className="flex gap-3 pt-4">
            //     <Button
            //       type="submit"
            //       disabled={submitting}
            //       className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            //     >
            //       {submitting ? (
            //         <>
            //           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            //           Updating...
            //         </>
            //       ) : (
            //         <>
            //           <Check className="w-4 h-4 mr-2" />
            //           Update Vendor
            //         </>
            //       )}
            //     </Button>
            //     <Button
            //       type="button"
            //       variant="outline"
            //       onClick={() => setIsEditDialogOpen(false)}
            //       disabled={submitting}
            //     >
            //       Cancel
            //     </Button>
            //   </div>
            // </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {alertDialog.action} vendor "
              {alertDialog.vendor?.name}"? This action will change their access
              status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleVendorAction(alertDialog.vendor?._id, alertDialog.action)
              }
              disabled={submitting}
              className={
                alertDialog.action === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {alertDialog.action === "approved" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Service Confirmation Dialog */}
      <AlertDialog
        open={deleteServiceModalOpen}
        onOpenChange={setDeleteServiceModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Service
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the service "{serviceToDelete?.title}"?
              This action cannot be undone and will permanently remove the service from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletingServiceId !== null}
              onClick={() => {
                setDeleteServiceModalOpen(false);
                setServiceToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteService}
              disabled={deletingServiceId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingServiceId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Service
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Vendor Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Partner
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the partner "{deleteDialog.vendor?.name}"?
              <br />
              <strong className="text-red-600">
                This action cannot be undone and will permanently delete the partner and ALL their services from the system.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              onClick={() => setDeleteDialog({ open: false, vendor: null })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteVendor(deleteDialog.vendor?._id)}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Partner
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => {
          setResetPasswordDialog({ open, vendor: resetPasswordDialog.vendor });
          if (!open) {
            setResetPasswordData({ newPassword: "", confirmPassword: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Reset Vendor Password
            </DialogTitle>
            <DialogDescription>
              Reset password for vendor: {resetPasswordDialog.vendor?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={resetPasswordData.newPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setResetPasswordDialog({ open: false, vendor: null });
                setResetPasswordData({ newPassword: "", confirmPassword: "" });
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Service Modal */}
      <AdminEditServiceModal
        isOpen={editServiceModalOpen}
        onClose={() => setEditServiceModalOpen(false)}
        service={serviceToEdit}
        onSave={handleSaveService}
        fetchServices={() => {
          // Refresh the vendor properties after edit
          if (selectedVendor) {
            handleRowClick(selectedVendor);
          }
        }}
      />
    </div>
  );
};

export default VendorManagement;
