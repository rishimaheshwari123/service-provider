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
} from "lucide-react";
import { signUp } from "@/service/operations/vendor";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import your API functions
import {
  getAllVendorAPI,
  updateVendorStatusAPI,
  updateVendorPersentageAPI,
  updateVendorProfileAPI,
  requestForTheUpdateProfileAPI,
} from "@/service/operations/vendor";
import { getVendorPropertyAPI } from "@/service/operations/property";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import AllBooking from "./AllBooking";
import VendorProfileMangeByAdmin from "./VendorProfileMangeByAdmin";
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [updatingPercentage, setUpdatingPercentage] = useState({});
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const [accepted, setAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
    address: "",
    description: "",
    adhar: "",
    pan: "",
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
      } else {
        setVendors([]);
        toast({
          title: "Info",
          description: "No vendors found",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
      toast({
        title: "Error",
        description: "Failed to load vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    console.log(user?.isvendor);
  }, []);

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

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();

    if (!accepted) {
      toast({
        title: "Error",
        description: "Please accept the Terms & Conditions before registering.",
        variant: "destructive",
      });
      return;
    }
    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "password",
      "phone",
      "company",
      "address",
      "adhar",
      "pan",
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
      const response = await signUp(formData);

      if (response) {
        toast({
          title: "Success",
          description: "Vendor registered successfully",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          company: "",
          address: "",
          description: "",
          adhar: "",
          pan: "",
          status: "approved",
        });

        setIsAddDialogOpen(false);

        // Refresh vendors list
        await fetchVendors();
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
      const response = await updateVendorProfileAPI(
        editingVendor._id,
        editingVendor
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.text("Vendor Details", 14, 10);

    // Table data
    const tableColumn = [
      "Vendor Name",
      "Email",
      "Company",
      "Commission ",
      "Phone",
      "Adhar",
      "Pan",
    ];
    const tableRows = filteredVendors.map((inquiry) => [
      inquiry.name,
      inquiry.email,
      inquiry.company,
      inquiry.percentage,
      inquiry.phone,
      inquiry.adhar,
      inquiry.pan,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("inquiries.pdf");
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

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
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
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Download PDF
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

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Add New Partner
                </DialogTitle>
                <DialogDescription>
                  Register a new vendor to list their properties
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddVendor} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company/Agency Name *
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Enter company name"
                    value={formData.company}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Business Address *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter business address"
                    value={formData.address}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adhar" className="flex items-center gap-2">
                      <IdCard className="w-4 h-4" />
                      Aadhar Number *
                    </Label>
                    <Input
                      id="adhar"
                      name="adhar"
                      placeholder="Enter Aadhar number"
                      value={formData.adhar}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      PAN Number *
                    </Label>
                    <Input
                      id="pan"
                      name="pan"
                      placeholder="Enter PAN number"
                      value={formData.pan}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell us about the business"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                  />
                </div>

                {/* ✅ Terms & Conditions Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Register Vendor
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {/* ✅ Terms & Conditions Modal */}
              {showTermsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-3">
                      Terms & Conditions
                    </h2>
                    <div className="max-h-64 overflow-y-auto text-gray-700 text-sm space-y-2">
                      <p>
                        1. By registering, you confirm that all provided details
                        are accurate and valid.
                      </p>
                      <p>
                        2. Vendors must comply with platform rules and maintain
                        the quality of listings.
                      </p>
                      <p>
                        3. Misuse, spam, or false data will lead to account
                        termination.
                      </p>
                      <p>
                        4. Data collected will be used for communication and
                        verification purposes only.
                      </p>
                      <p>
                        5. The platform reserves the right to modify these terms
                        at any time.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowTermsModal(false)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setAccepted(true);
                          setShowTermsModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                    <TableHead>Status</TableHead>
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
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {vendor.company}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
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
              {/* ---- Update Profile Request Status ---- */}
              {selectedVendor.updateProfileRequest === "requested" && (
                <div className="flex items-center justify-between p-4 mb-4 bg-blue-50 rounded-md border border-blue-200">
                  <span className="font-medium text-blue-700">
                    Vendor has requested profile update.
                  </span>
                  <div className="flex gap-2">
                    {/* Approve Button */}
                    <Button
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={async () => {
                        const result = await requestForTheUpdateProfileAPI(
                          selectedVendor._id,
                          "approved"
                        );
                        if (result?.success) {
                          setSelectedVendor((prev) => ({
                            ...prev,
                            updateProfileRequest: "approved",
                          }));
                          toast({
                            title: "Success",
                            description: `Request update successfully`,
                          });
                        }
                      }}
                    >
                      Approve
                    </Button>

                    {/* Reject Button */}
                    <Button
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={async () => {
                        const result = await requestForTheUpdateProfileAPI(
                          selectedVendor._id,
                          "pending"
                        );
                        if (result?.success) {
                          setSelectedVendor((prev) => ({
                            ...prev,
                            updateProfileRequest: "pending",
                          }));
                          toast({
                            title: "Success",
                            description: `Request reject successfully`,
                          });
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Vendor Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedVendor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedVendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Company:</span>
                      <span>{selectedVendor.company}</span>
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

                {/* ... Additional Details Card */}
              </div>

              {/* Properties Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Services ({vendorProperties.length})
                    {loadingProperties && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>{/* ... Property cards */}</CardContent>
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
    </div>
  );
};

export default VendorManagement;
