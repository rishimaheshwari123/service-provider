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
  { id: 7, title: "Submit", icon: "✅" },
];

// Import your API functions
import {
  getAllVendorAPI,
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
  const [loading, setLoading] = useState(true);
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
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    document1: null,
    document2: null,
    document3: null,
    document4: null,
    document5: null,
  });
  
  // OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log(user);

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

  // Fetch all vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await getAllVendorAPI();
      console.log("Vendors response:", response);

      if (response && Array.isArray(response)) {
        setVendors(response);
        // Initialize percentages with existing values
        const initialPercentages = {};
        response.forEach((vendor) => {
          initialPercentages[vendor._id] = vendor.percentage || "";
        });
        setPercentages(initialPercentages);
        
        toast({
          title: "Success",
          description: `Loaded ${response.length} vendors successfully`,
        });
        
        // Load payment status in background (non-blocking)
        setLoading(false); // Show vendors immediately
        checkPendingPayments(response); // Load payment status in background
        
      } else {
        setVendors([]);
        toast({
          title: "Info",
          description: "No vendors found",
          variant: "default",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
      toast({
        title: "Error",
        description: "Failed to load vendors. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Check pending payments for all vendors - OPTIMIZED
  const checkPendingPayments = async (vendorsList) => {
    console.log("🔍 Checking pending payments for", vendorsList.length, "vendors");
    setPaymentStatusLoading(true);
    
    try {
      // Make all API calls in parallel instead of sequential
      const results = await Promise.allSettled(
        vendorsList.map(async (vendor) => {
          try {
            const [pendingPurchases, purchasedCategories] = await Promise.all([
              getVendorPendingCategoryPurchasesAPI(vendor._id),
              getPurchasedCategoriesAPI(vendor._id)
            ]);
            
            return {
              vendorId: vendor._id,
              vendorName: vendor.name,
              hasPending: pendingPurchases && pendingPurchases.length > 0,
              hasPurchased: purchasedCategories && purchasedCategories.length > 0,
              pendingCount: pendingPurchases?.length || 0,
              purchasedCount: purchasedCategories?.length || 0
            };
          } catch (error) {
            console.error(`❌ Error for vendor ${vendor.name}:`, error);
            return {
              vendorId: vendor._id,
              vendorName: vendor.name,
              hasPending: false,
              hasPurchased: false,
              pendingCount: 0,
              purchasedCount: 0
            };
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
          
          console.log(`✅ ${data.vendorName}: Pending=${data.pendingCount}, Paid=${data.purchasedCount}`);
        }
      });
      
      console.log("✅ Payment check completed for all vendors");
      setVendorPendingPayments(pendingMap);
      setVendorPurchasedCategories(purchasedMap);
      
    } catch (error) {
      console.error("❌ Error checking payments:", error);
      setVendorPendingPayments({});
      setVendorPurchasedCategories({});
    } finally {
      setPaymentStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    console.log(user?.isvendor);
  }, []);

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

  const handleFileChange = (docKey: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [docKey]: file }));
  };

  const nextStep = () => {
    // Validate step 2 for WhatsApp selection and OTP verification
    if (currentStep === 2) {
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
      // Check OTP verification
      if (!isPhoneVerified) {
        toast({
          title: "Error",
          description: "Please verify your phone number with OTP before proceeding",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < 7) {
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
      setOtpSent(false);
      setOtp('');
      
      toast({
        title: "Success",
        description: "Phone number verified successfully!",
      });
    }
  };

  const progress = (currentStep / 7) * 100;

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

    // Only submit on step 7
    if (currentStep !== 7) {
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
      
      const submitData = {
        ...vendorData,
        category, // Include category ObjectId
        subCategory, // Include subCategory string
        isAdmin: true, // Flag to identify admin registrations
        numberOfStaff: vendorData.numberOfStaff ? parseInt(vendorData.numberOfStaff) : 0,
        paymentMethod: vendorData.paymentMethod,
        bankDetail: vendorData.paymentMethod === "bank" ? {
          accountNumber: vendorData.accountNumber,
          IFSC: vendorData.ifscCode,
          accountHolderName: vendorData.accountHolderName,
          branch: vendorData.bankName,
        } : undefined,
        upiId: vendorData.paymentMethod === "upi" ? vendorData.upiId : undefined,
        experience: {
          totalYears: vendorData.totalYears ? parseInt(vendorData.totalYears) : 0,
          fields: vendorData.servicesOffered ? vendorData.servicesOffered.split(",").map(s => s.trim()) : [],
        },
      };
      
      const response = await signUp(submitData);

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
        setDocuments({
          document1: null,
          document2: null,
          document3: null,
          document4: null,
          document5: null,
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
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Profile Update Notifications */}
      <VendorProfileUpdateNotifications />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            Partner Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage partner applications and approvals
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Download Excel
          </button>
          <Button
            variant="outline"
            onClick={fetchVendors}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Add New Partner - Step {currentStep} of 7
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
                      className={`flex flex-col items-center min-w-[60px] cursor-pointer ${
                        currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                      }`}
                      onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 ${
                          currentStep > step.id
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

              <form onSubmit={handleAddVendor} className="space-y-4">
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
                        <Label>Category (Service) <span className="text-red-500">*</span></Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={(val) => {
                            setSelectedCategory(val);
                            setFormData(prev => ({ ...prev, category: val }));
                            const selectedCat = categories.find(c => c._id === val);
                            if (selectedCat?.autoFilled) {
                              setSelectedAutoFilled(selectedCat.autoFilled);
                              setFormData(prev => ({ ...prev, subCategory: selectedCat.autoFilled }));
                            } else {
                              setSelectedAutoFilled("");
                              setFormData(prev => ({ ...prev, subCategory: "" }));
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
                        <Label>Category (Auto Filled) <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="Auto-filled based on category"
                          value={selectedAutoFilled}
                          onChange={(e) => {
                            setSelectedAutoFilled(e.target.value);
                            setFormData(prev => ({ ...prev, subCategory: e.target.value }));
                          }}
                          className="bg-gray-50"
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
                          {hasWhatsApp === false && isPhoneVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            name="phone"
                            placeholder="10-digit number"
                            value={formData.phone}
                            onChange={(e) => {
                              handleFormChange(e);
                              setIsPhoneVerified(false);
                              setOtpSent(false);
                              setOtp('');
                            }}
                            className={hasWhatsApp === false && isPhoneVerified ? "bg-green-50 border-green-200" : ""}
                          />
                          {hasWhatsApp === false && (
                            <Button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading || !formData.phone || formData.phone.length !== 10}
                              variant="outline"
                            >
                              {otpLoading ? "Sending..." : isPhoneVerified ? "Resend" : "Verify"}
                            </Button>
                          )}
                        </div>
                        {hasWhatsApp === false && isPhoneVerified && (
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
                            {isPhoneVerified && <span className="text-green-600 ml-2">✓ Verified</span>}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              name="whatsappNumber"
                              placeholder="10-digit WhatsApp number"
                              value={formData.whatsappNumber}
                              onChange={(e) => {
                                handleFormChange(e);
                                setIsPhoneVerified(false);
                                setOtpSent(false);
                                setOtp('');
                              }}
                              className={isPhoneVerified ? "bg-green-50 border-green-200" : ""}
                            />
                            <Button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading || !formData.whatsappNumber || formData.whatsappNumber.length !== 10}
                              variant="outline"
                            >
                              {otpLoading ? "Sending..." : isPhoneVerified ? "Resend" : "Verify"}
                            </Button>
                          </div>
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
                              Please verify the {hasWhatsApp ? 'WhatsApp number' : 'phone number'} with OTP before proceeding to the next step.
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Aadhaar Number</Label>
                        <Input
                          name="adhar"
                          placeholder="12-digit Aadhaar number (optional)"
                          value={formData.adhar}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PAN Number</Label>
                        <Input
                          name="pan"
                          placeholder="ABCDE1234F (optional)"
                          value={formData.pan}
                          onChange={handleFormChange}
                          className="uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>GST Number (if applicable)</Label>
                        <Input
                          name="gstNumber"
                          placeholder="Enter GST number"
                          value={formData.gstNumber}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trade License / Shop Act Registration No.</Label>
                        <Input
                          name="tradeLicense"
                          placeholder="Enter license number (if applicable)"
                          value={formData.tradeLicense}
                          onChange={handleFormChange}
                        />
                      </div>
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
                            className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                              workingDays[day.key as keyof typeof workingDays]
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
                      📄 All documents are optional. You can upload up to 5 documents (Aadhaar, PAN, GST Certificate, Address Proof, Business Registration, etc.)
                    </p>

                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="space-y-2">
                        <Label>Document {num}</Label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
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
                  
                  {currentStep < 7 ? (
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
                      type="submit"
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
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            All Partners ({filteredVendors.length})
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
            <div className="overflow-x-auto">
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
                      <span>{selectedVendor.subCategory || "Not Added"}</span>
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
                                  className={`${
                                    property.status === 'active' 
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
