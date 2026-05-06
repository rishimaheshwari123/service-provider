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
import { getAllVendorRewardSettings, updateVendorRewardSettings } from "@/service/operations/rewardAPI";
import { Store, Search, Settings, DollarSign, Percent, MoreVertical, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VendorRewardSettings = () => {
  const { token } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    acceptsRewardPoints: false,
    discountType: "flat",
    maxDiscountAmount: 0,
    minOrderValue: 0,
    isActive: true,
    notes: "",
  });

  useEffect(() => {
    fetchVendors();
  }, [page]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await getAllVendorRewardSettings(token, page, 10, search);
      if (response.success) {
        setVendors(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchVendors();
  };

  const openEditDialog = (vendor: any) => {
    setSelectedVendor(vendor);
    setFormData({
      acceptsRewardPoints: vendor.acceptsRewardPoints || false,
      discountType: vendor.discountType || "flat",
      maxDiscountAmount: vendor.maxDiscountAmount || 0,
      minOrderValue: vendor.minOrderValue || 0,
      isActive: vendor.isActive !== undefined ? vendor.isActive : true,
      notes: vendor.rewardSettingsNotes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      setLoading(true);
      await updateVendorRewardSettings(token, selectedVendor.vendorId._id, formData);
      setIsDialogOpen(false);
      fetchVendors();
    } catch (error) {
      console.error("Error updating vendor settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="w-8 h-8 text-purple-600" />
          Vendor Reward Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure reward acceptance for each vendor</p>
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
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
          <CardDescription>Manage reward point acceptance for vendors</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No vendors found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Vendor</th>
                    <th className="text-left p-3">Contact</th>
                    <th className="text-left p-3">Accepts Rewards</th>
                    <th className="text-left p-3">Discount Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor: any) => (
                    <tr key={vendor._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{vendor.vendorId?.name}</p>
                          <p className="text-sm text-gray-500">{vendor.vendorId?.company}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{vendor.vendorId?.email}</p>
                          <p className="text-sm text-gray-500">{vendor.vendorId?.phone}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        {vendor.acceptsRewardPoints ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {vendor.discountType === "flat" ? (
                            <DollarSign className="w-4 h-4" />
                          ) : (
                            <Percent className="w-4 h-4" />
                          )}
                          <span className="capitalize">{vendor.discountType}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {vendor.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </td>
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
                              Edit Settings
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Configure Vendor Reward Settings
            </DialogTitle>
            <DialogDescription>
              <div className="mt-2">
                <p className="font-semibold text-gray-900">{selectedVendor?.vendorId?.name}</p>
                <p className="text-sm">{selectedVendor?.vendorId?.company}</p>
                <p className="text-sm text-gray-500">{selectedVendor?.vendorId?.email}</p>
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
                        <p className="text-xs text-gray-500">1 point = 1% discount</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                    If a customer has <strong>100 points</strong> and uses them:
                    <br />
                    • Discount: <strong>
                      {formData.discountType === "flat" ? "₹100" : "100%"}
                    </strong>
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
    </div>
  );
};

export default VendorRewardSettings;
