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
import { 
  getPendingUpdateRequestsAPI,
  approveUpdateRequestAPI,
  rejectUpdateRequestAPI 
} from "@/service/operations/vendorProfileUpdateRequest";
import { useVendorNotifications } from "@/hooks/useVendorNotifications";
import VendorProfileMangeByAdmin from "./VendorProfileMangeByAdmin";
import VendorProfileUpdateComparison from "./VendorProfileUpdateComparison";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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

interface UpdateRequest {
  _id: string;
  vendorId: Vendor;
  status: string;
  requestedChanges: any;
  originalData: any;
  changedFields: string[];
  createdAt: string;
  updatedAt: string;
}

const VendorProfileUpdateNotifications = () => {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    request: null as UpdateRequest | null,
    action: "",
  });
  const { toast } = useToast();
  const { refreshNotifications } = useVendorNotifications();
  const user = useSelector((state: RootState) => state.auth?.user);

  useEffect(() => {
    fetchPendingUpdateRequests();
  }, []);

  const fetchPendingUpdateRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingUpdateRequestsAPI();
      
      if (response && Array.isArray(response)) {
        setRequests(response);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching update requests:", error);
      toast({
        title: "Error",
        description: "Failed to load profile update requests",
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const response = await approveUpdateRequestAPI(requestId, user?._id || "");

      if (response?.success) {
        // Remove the request from the list
        setRequests(requests.filter(r => r._id !== requestId));
        
        // Refresh the notification count
        refreshNotifications();
        
        toast({
          title: "Success",
          description: "Profile update request approved successfully",
        });
      } else {
        throw new Error(response?.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve profile update request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
      setAlertDialog({ open: false, request: null, action: "" });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const response = await rejectUpdateRequestAPI(
        requestId,
        user?._id || "",
        "Request rejected by admin"
      );

      if (response?.success) {
        // Remove the request from the list
        setRequests(requests.filter(r => r._id !== requestId));
        
        // Refresh the notification count
        refreshNotifications();
        
        toast({
          title: "Success",
          description: "Profile update request rejected successfully",
        });
      } else {
        throw new Error(response?.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject profile update request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
      setAlertDialog({ open: false, request: null, action: "" });
    }
  };

  const handleViewProfile = (request: UpdateRequest) => {
    setSelectedRequest(request);
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
                {requests.length > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {requests.length} Pending
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
              onClick={fetchPendingUpdateRequests}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium">No pending requests</p>
              <p className="text-gray-400 text-sm">
                All vendor profile update requests have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const vendor = request.vendorId;
                return (
                  <div
                    key={request._id}
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
                              <span>Requested: {formatDate(request.createdAt)}</span>
                            </div>
                          
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProfile(request)}
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
                              request,
                              action: "approve",
                            })
                          }
                          disabled={processing === request._id}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          {processing === request._id ? (
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
                              request,
                              action: "reject",
                            })
                          }
                          disabled={processing === request._id}
                          className="flex items-center gap-1"
                        >
                          {processing === request._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Profile Update Request - {selectedRequest?.vendorId?.name}
            </DialogTitle>
            <DialogDescription>
              Review the requested changes before approving or rejecting
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Vendor Info */}
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg">Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name:</p>
                      <p className="font-semibold">{selectedRequest.vendorId.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Company:</p>
                      <p className="font-semibold">{selectedRequest.vendorId.company}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone:</p>
                      <p className="font-semibold">{selectedRequest.vendorId.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-semibold">{selectedRequest.vendorId.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison View */}
              <VendorProfileUpdateComparison
                originalData={selectedRequest.originalData}
                requestedChanges={selectedRequest.requestedChanges}
                changedFields={selectedRequest.changedFields}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setAlertDialog({
                      open: true,
                      request: selectedRequest,
                      action: "reject",
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setAlertDialog({
                      open: true,
                      request: selectedRequest,
                      action: "approve",
                    });
                  }}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            </div>
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
              {alertDialog.action === "approve" ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              {alertDialog.action === "approve" ? "Accept" : "Reject"} Profile Update Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {alertDialog.action === "approve" ? "accept" : "reject"} the profile update request from{" "}
              <strong>{alertDialog.request?.vendorId?.name}</strong>?
              {alertDialog.action === "approve" 
                ? " This will apply all the requested changes to the vendor profile."
                : " This will reject their request and they can submit a new request."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (alertDialog.action === "approve") {
                  handleApprove(alertDialog.request?._id!);
                } else {
                  handleReject(alertDialog.request?._id!);
                }
              }}
              disabled={processing !== null}
              className={
                alertDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processing !== null ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {alertDialog.action === "approve" ? "Accept Request" : "Reject Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VendorProfileUpdateNotifications;