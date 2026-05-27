import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllVendorPaginatedAPI } from "@/service/operations/vendor";
import { apiConnector } from "@/service/apiConnector";
import { vendor as vendorEndpoints, reward as rewardEndpoints } from "@/service/apis";
import { Store, Search, Settings, DollarSign, Percent, MoreVertical, Edit, Building2, Calendar, Gift, User, History, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

const RewardApplications = () => {
  const { token } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [vendorHistory, setVendorHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const [formData, setFormData] = useState({
    acceptsRewardPoints: false,
    discountType: "flat",
    discountPercentage: 0,
    maxDiscountAmount: 0,
    minOrderValue: 0,
    isActive: true,
    notes: "",
  });

  useEffect(() => {
    fetchAllVendors(1, "");
  }, []);

  // Search triggered by button click or Enter key
  const handleSearch = () => {
    setCurrentPage(1);
    fetchAllVendors(1, search);
  };

  const fetchAllVendors = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      const result = await getAllVendorPaginatedAPI({ page, limit: ITEMS_PER_PAGE, search: searchQuery, token });

      if (result && result.vendors) {
        const validVendors = result.vendors.filter((vendor: any) =>
          vendor.name && vendor.name.trim() !== "" && vendor.name !== "N/A"
        );

        setVendors(validVendors);
        setCurrentPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setTotalVendors(result.pagination.total);
      } else {
        setVendors([]);
        setTotalVendors(0);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
      setTotalVendors(0);
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (vendor: any) => {
    setSelectedVendor(vendor);
    // Set form data from vendor's existing reward settings or defaults
    setFormData({
      acceptsRewardPoints: vendor.acceptsRewardPoints || false,
      discountType: vendor.discountType || "flat",
      discountPercentage: vendor.discountPercentage || 0,
      maxDiscountAmount: vendor.maxDiscountAmount || 0,
      minOrderValue: vendor.minOrderValue || 0,
      isActive: vendor.rewardSettingsActive !== undefined ? vendor.rewardSettingsActive : true,
      notes: vendor.rewardSettingsNotes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setLoading(true);
      const response = await apiConnector(
        "PUT",
        `${vendorEndpoints.UPDATE_REWARD_SETTINGS_API}/${selectedVendor._id}`,
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setIsDialogOpen(false);
        fetchAllVendors(currentPage, search); // Refresh the current page
        toast.success("Vendor reward settings updated successfully");
      }
    } catch (error) {
      console.error("Error updating vendor settings:", error);
      toast.error("Failed to update vendor settings");
    } finally {
      setLoading(false);
    }
  };

  const openHistoryDialog = async (vendor: any) => {
    setSelectedVendor(vendor);
    setIsHistoryDialogOpen(true);
    await fetchVendorHistory(vendor._id);
  };

  const fetchVendorHistory = async (vendorId: string) => {
    try {
      setLoadingHistory(true);
      // Use dedicated admin endpoint for vendor history
      const response = await apiConnector(
        "GET",
        `${rewardEndpoints.GET_VENDOR_HISTORY_API}/${vendorId}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setVendorHistory(response.data.data);
        if (response.data.data.length > 0) {
          toast.success(`Found ${response.data.data.length} applied codes`);
        }
      }
    } catch (error) {
      console.error("Error fetching vendor history:", error);
      toast.error("Failed to fetch vendor history");
      setVendorHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="w-8 h-8 text-purple-600" />
          Reward Applications
        </h1>
        <p className="text-gray-600 mt-2">Configure reward acceptance and discount for each vendor</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vendors by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
            {search && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                  fetchAllVendors(1, "");
                }}
                disabled={loading}
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                All Vendors ({totalVendors} total, showing {vendors.length})
              </CardTitle>
              <CardDescription>Manage reward point acceptance and discount settings for vendors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? "No vendors found matching your search" : "No vendors found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">Partner</th>
                    <th className="text-left p-3 font-semibold">Company</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Accepts Rewards</th>
                    <th className="text-left p-3 font-semibold">Discount Type</th>
                    <th className="text-left p-3 font-semibold">Discount %</th>
                    <th className="text-left p-3 font-semibold">Registered</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor: any) => (
                    <tr key={vendor._id} className="border-b hover:bg-gray-50">
                      {/* Partner */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                            {vendor.name ? vendor.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <p className="font-medium">{vendor.name || "N/A"}</p>
                            <p className="text-sm text-gray-500">{vendor.email || "N/A"}</p>
                            <p className="text-sm text-gray-500">{vendor.phone || "N/A"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{vendor.company || "N/A"}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{vendor.category?.name || "N/A"}</p>
                          {vendor.subCategory && (
                            <p className="text-sm text-gray-500">{vendor.subCategory}</p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {vendor.status === "approved" ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : vendor.status === "pending" ? (
                          <Badge variant="secondary">Pending</Badge>
                        ) : (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </td>

                      {/* Accepts Rewards */}
                      <td className="p-3">
                        {vendor.acceptsRewardPoints ? (
                          <Badge variant="default" className="bg-green-500">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </td>

                      {/* Discount Type */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {vendor.discountType === "flat" ? (
                            <>
                              <DollarSign className="w-4 h-4" />
                              <span>Flat</span>
                            </>
                          ) : (
                            <>
                              <Percent className="w-4 h-4" />
                              <span>Percentage</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Discount % */}
                      <td className="p-3">
                        {vendor.discountType === "percentage" && vendor.discountPercentage ? (
                          <span className="font-semibold">{vendor.discountPercentage}%</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Registered */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "N/A"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(vendor)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Reward Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openHistoryDialog(vendor)}>
                              <History className="w-4 h-4 mr-2" />
                              View Applied Codes History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} &bull; {totalVendors} total vendors
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    fetchAllVendors(newPage, search);
                  }}
                  disabled={currentPage <= 1 || loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
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
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          fetchAllVendors(pageNum, search);
                        }}
                        disabled={loading}
                        className={`w-8 h-8 text-sm rounded-md border ${
                          currentPage === pageNum
                            ? "bg-purple-600 text-white border-purple-600"
                            : "hover:bg-gray-50"
                        } disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchAllVendors(newPage, search);
                  }}
                  disabled={currentPage >= totalPages || loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Total Count */}
          {!loading && vendors.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {vendors.length} of {totalVendors} vendors
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Configure Vendor Reward Settings
            </DialogTitle>
            <DialogDescription>
              <div className="mt-2">
                <p className="font-semibold text-gray-900">{selectedVendor?.name}</p>
                <p className="text-sm">{selectedVendor?.company}</p>
                <p className="text-sm text-gray-500">{selectedVendor?.email}</p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Accept Reward Points */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="acceptsRewardPoints" className="text-base font-medium">
                  Accepts Reward Points
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enable this vendor to accept customer reward points
                </p>
              </div>
              <Switch
                id="acceptsRewardPoints"
                checked={formData.acceptsRewardPoints}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acceptsRewardPoints: checked })
                }
              />
            </div>

            {/* Discount Type */}
            <div>
              <Label htmlFor="discountType" className="text-base font-medium">
                Discount Type
              </Label>
              <p className="text-sm text-gray-500 mb-2">
                How should reward points be converted to discount?
              </p>
              <Select
                value={formData.discountType}
                onValueChange={(value) => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger id="discountType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Flat Amount (₹)</p>
                        <p className="text-xs text-gray-500">1 point = ₹1 discount</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Percentage (%)</p>
                        <p className="text-xs text-gray-500">Points converted to % discount</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Percentage (only for percentage type) */}
            {formData.discountType === "percentage" && (
              <div>
                <Label htmlFor="discountPercentage" className="text-base font-medium">
                  Discount Percentage
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Set the percentage discount that will be applied when customer uses reward points
                </p>
                <div className="relative">
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Enter percentage (e.g., 10 for 10%)"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Example: If set to 10%, customer will get 10% discount on their order
                </p>
              </div>
            )}

            {/* Max Discount */}
            <div>
              <Label htmlFor="maxDiscountAmount" className="text-base font-medium">
                Maximum Discount Amount (Optional)
              </Label>
              <p className="text-sm text-gray-500 mb-2">
                Set a maximum discount limit. Leave 0 for no limit.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  min="0"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscountAmount: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0 for no limit"
                  className="pl-8"
                />
              </div>
            </div>

            {/* Min Order Value */}
            <div>
              <Label htmlFor="minOrderValue" className="text-base font-medium">
                Minimum Order Value (Optional)
              </Label>
              <p className="text-sm text-gray-500 mb-2">
                Minimum order amount required to use reward points. Leave 0 for no minimum.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="minOrderValue"
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0 for no minimum"
                  className="pl-8"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active Status
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enable or disable reward acceptance for this vendor
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-base font-medium">
                Notes (Optional)
              </Label>
              <p className="text-sm text-gray-500 mb-2">
                Add any additional notes or instructions for this vendor's reward settings
              </p>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter notes here..."
                className="min-h-[100px] resize-y"
              />
            </div>

            {/* Example */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Example:</p>
              <p className="text-sm text-blue-800">
                {formData.acceptsRewardPoints ? (
                  <>
                    {formData.discountType === "flat" ? (
                      <>
                        If a customer has <strong>100 points</strong> and uses them:
                        <br />
                        • Discount: <strong>₹100</strong>
                      </>
                    ) : (
                      <>
                        If customer uses reward points:
                        <br />
                        • Discount: <strong>{formData.discountPercentage}%</strong> off on order
                      </>
                    )}
                    {formData.maxDiscountAmount > 0 && (
                      <>
                        <br />• Maximum discount capped at: <strong>₹{formData.maxDiscountAmount}</strong>
                      </>
                    )}
                    {formData.minOrderValue > 0 && (
                      <>
                        <br />• Minimum order required: <strong>₹{formData.minOrderValue}</strong>
                      </>
                    )}
                  </>
                ) : (
                  "This vendor does not accept reward points."
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Settings className="w-4 h-4" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Applied Codes History
            </DialogTitle>
            <DialogDescription>
              <div className="mt-2">
                <p className="font-semibold text-gray-900">{selectedVendor?.name}</p>
                <p className="text-sm">{selectedVendor?.company}</p>
                <p className="text-sm text-gray-500">{selectedVendor?.email}</p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading history...</p>
              </div>
            ) : vendorHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No codes applied yet by this vendor</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Total codes applied: <strong>{vendorHistory.length}</strong>
                  </p>
                </div>
                {vendorHistory.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <code className="font-mono font-bold text-lg">{item.code}</code>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{item.userId?.name || "Unknown"}</span>
                          <span>•</span>
                          <span>{item.userId?.phone}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.points} points used
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        {item.discountType === "flat" ? (
                          <>
                            <DollarSign className="w-5 h-5" />₹{item.discountAmount}
                          </>
                        ) : (
                          <>
                            <Percent className="w-5 h-5" />
                            {item.discountAmount}%
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.appliedBy?.appliedAt || item.createdAt), "MMM dd, yyyy HH:mm")}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardApplications;
