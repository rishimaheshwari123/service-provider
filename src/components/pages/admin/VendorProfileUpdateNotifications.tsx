import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  User,
  Building2,
  Phone,
  Mail,
  Check,
  X,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { getAllVendorAPI, requestForTheUpdateProfileAPI } from "@/service/operations/vendor";
import { useVendorNotifications } from "@/hooks/useVendorNotifications";
import VendorProfileMangeByAdmin from "./VendorProfileMangeByAdmin";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  description: string;
  status: string;
  updateProfileRequest: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

const VendorProfileUpdateNotifications = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    vendor: null as Vendor | null,
    action: "",
  });
  const { toast } = useToast();
  const { refreshNotifications } = useVendorNotifications();

  useEffect(() => {
    fetchVendorsWithUpdateRequests();
  }, []);

  const fetchVendorsWithUpdateRequests = async () => {
    try {
      setLoading(true);
      const response = await getAllVendorAPI();
      
      if (response && Array.isArray(response)) {
        // Filter vendors with pending profile update requests
        const vendorsWithRequests = response.filter(
          (vendor) => vendor.updateProfileRequest === "requested"
        );
        setVendors(vendorsWithRequests);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to load vendor update requests",
        variant: "destructive",
      });
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (vendorId: string, action: string) => {
    try {
      setProcessing(vendorId);
      const response = await requestForTheUpdateProfileAPI(vendorId, action);

      if (response?.success) {
        // Remove the vendor from the list since request is processed
        setVendors(vendors.filter(v => v._id !== vendorId));
        
        // Refresh the notification count in sidebar
        refreshNotifications();
        
        toast({
          title: "Success",
          description: `Profile update request ${action} successfully`,
        });
      } else {
        throw new Error(response?.message || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast({
        title: "Error",
        description: "Failed to process profile update request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
      setAlertDialog({ open: false, vendor: null, action: "" });
    }
  };

  const handleViewProfile = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsViewDialogOpen(true);
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Profile Update Requests
                {vendors.length > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {vendors.length} Pending
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Vendors requesting profile updates that need admin approval
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVendorsWithUpdateRequests}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium">No pending requests</p>
              <p className="text-gray-400 text-sm">
                All vendor profile update requests have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        {vendor.profilePhoto ? (
                          <AvatarImage src={vendor.profilePhoto} alt={vendor.name} />
                        ) : (
                          <AvatarFallback className="bg-orange-100 text-orange-700">
                            {getInitials(vendor.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {vendor.name}
                          </h3>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span className="truncate">{vendor.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{vendor.phone}</span>
                          </div>
                          {vendor.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{vendor.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Requested: {formatDate(vendor.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(vendor)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() =>
                          setAlertDialog({
                            open: true,
                            vendor,
                            action: "approved",
                          })
                        }
                        disabled={processing === vendor._id}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                      >
                        {processing === vendor._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Accept
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setAlertDialog({
                            open: true,
                            vendor,
                            action: "pending",
                          })
                        }
                        disabled={processing === vendor._id}
                        className="flex items-center gap-1"
                      >
                        {processing === vendor._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Vendor Profile - {selectedVendor?.name}
            </DialogTitle>
            <DialogDescription>
              Review vendor profile details before approving the update request
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <VendorProfileMangeByAdmin user={selectedVendor} />
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
            <AlertDialogTitle className="flex items-center gap-2">
              {alertDialog.action === "approved" ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              {alertDialog.action === "approved" ? "Accept" : "Reject"} Profile Update Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {alertDialog.action === "approved" ? "accept" : "reject"} the profile update request from{" "}
              <strong>{alertDialog.vendor?.name}</strong>?
              {alertDialog.action === "approved" 
                ? " This will allow the vendor to update their profile information."
                : " This will reject their request and they will need to submit a new request."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleRequestAction(alertDialog.vendor?._id!, alertDialog.action)
              }
              disabled={processing !== null}
              className={
                alertDialog.action === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processing !== null ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {alertDialog.action === "approved" ? "Accept Request" : "Reject Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VendorProfileUpdateNotifications;