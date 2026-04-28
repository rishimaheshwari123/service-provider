import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiConnector } from "@/service/apiConnector";
import { reward as rewardEndpoints } from "@/service/apis";
import { Gift, CheckCircle, XCircle, User, Calendar, DollarSign, Percent, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const VendorRewardApply = () => {
  const { token, user } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [appliedCodes, setAppliedCodes] = useState<any[]>([]);
  const [vendorSettings, setVendorSettings] = useState<any>(null);
  const [lastAppliedCode, setLastAppliedCode] = useState<any>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeDetails, setCodeDetails] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchVendorSettings();
      fetchAppliedCodes();
    }
  }, [token]);

  const fetchVendorSettings = async () => {
    try {
      const response = await apiConnector(
        "GET",
        rewardEndpoints.CHECK_VENDOR_SETTINGS_API,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      if (response.data.success) {
        setVendorSettings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vendor settings:", error);
    }
  };

  const fetchAppliedCodes = async () => {
    try {
      const response = await apiConnector(
        "GET",
        rewardEndpoints.GET_VENDOR_APPLIED_CODES_API,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      if (response.data.success) {
        setAppliedCodes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applied codes:", error);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 8) {
      toast.error("Please enter a valid 8-character code");
      return;
    }

    try {
      setVerifyingCode(true);
      // Verify code without applying
      const response = await apiConnector(
        "POST",
        rewardEndpoints.VERIFY_REDEEM_CODE_API,
        { code: code.toUpperCase() },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setCodeDetails(response.data.data);
        toast.success("Code verified! Review details and click Apply to confirm.");
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast.error(error?.response?.data?.message || "Invalid or expired code");
      setCodeDetails(null);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleApplyCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter a redeem code");
      return;
    }

    if (!vendorSettings?.acceptsRewardPoints) {
      toast.error("Your account is not enabled to accept reward points. Please contact admin.");
      return;
    }

    try {
      setLoading(true);
      const response = await apiConnector(
        "POST",
        rewardEndpoints.APPLY_REDEEM_CODE_API,
        { code: code.toUpperCase() },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      if (response.data.success) {
        setLastAppliedCode(response.data.data);
        setCode("");
        setCodeDetails(null);
        fetchAppliedCodes();
        toast.success("Reward code applied successfully!");
      }
    } catch (error: any) {
      console.error("Error applying code:", error);
      toast.error(error?.response?.data?.message || "Failed to apply code");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!codeDetails || !vendorSettings) return 0;

    if (vendorSettings.discountType === "percentage") {
      return vendorSettings.discountPercentage || 0;
    } else {
      // Flat discount: 1 point = ₹1
      return codeDetails.points;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="w-8 h-8 text-purple-600" />
            Apply Reward Code
          </h1>
          <p className="text-gray-600 mt-2">Accept customer reward points and apply discount</p>
        </div>

        {/* Vendor Settings Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reward Acceptance Status</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorSettings?.acceptsRewardPoints ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Your account is enabled to accept reward points</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Discount Type</p>
                    <p className="font-semibold flex items-center gap-1">
                      {vendorSettings.discountType === "flat" ? (
                        <>
                          <DollarSign className="w-4 h-4" />
                          Flat Amount (₹)
                        </>
                      ) : (
                        <>
                          <Percent className="w-4 h-4" />
                          Percentage (%)
                        </>
                      )}
                    </p>
                  </div>
                  {vendorSettings.discountType === "percentage" && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Discount Percentage</p>
                      <p className="font-semibold text-lg">{vendorSettings.discountPercentage}%</p>
                    </div>
                  )}
                  {vendorSettings.maxDiscountAmount > 0 && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Max Discount</p>
                      <p className="font-semibold">₹{vendorSettings.maxDiscountAmount}</p>
                    </div>
                  )}
                  {vendorSettings.minOrderValue > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Min Order Value</p>
                      <p className="font-semibold">₹{vendorSettings.minOrderValue}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">
                  Your account is not enabled to accept reward points. Contact admin to enable.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apply Code Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Apply Customer Redeem Code</CardTitle>
            <CardDescription>
              Enter the 8-character code provided by the customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Redeem Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCodeDetails(null);
                    }}
                    placeholder="Enter 8-character code"
                    maxLength={8}
                    className="font-mono text-lg uppercase"
                    disabled={!vendorSettings?.acceptsRewardPoints}
                  />
                  <Button
                    onClick={handleVerifyCode}
                    disabled={verifyingCode || !vendorSettings?.acceptsRewardPoints || code.length !== 8}
                    variant="outline"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {verifyingCode ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>

              {/* Code Details Preview */}
              {codeDetails && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Code Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Customer</p>
                      <p className="font-medium">{codeDetails.userId?.name}</p>
                      <p className="text-xs text-gray-500">{codeDetails.userId?.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Points</p>
                      <p className="font-medium text-lg">{codeDetails.points} points</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Discount Amount</p>
                      <p className="font-medium text-green-600 text-lg">
                        {vendorSettings.discountType === "flat" ? (
                          `₹${calculateDiscount()}`
                        ) : (
                          `${calculateDiscount()}%`
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expires At</p>
                      <p className="font-medium text-sm">
                        {format(new Date(codeDetails.expiresAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleApplyCode}
                    disabled={loading}
                    className="w-full gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    {loading ? "Applying..." : "Apply Discount"}
                  </Button>
                </div>
              )}

              {!codeDetails && (
                <Button
                  onClick={handleApplyCode}
                  disabled={loading || !vendorSettings?.acceptsRewardPoints || code.length !== 8}
                  className="gap-2"
                >
                  <Gift className="w-4 h-4" />
                  {loading ? "Applying..." : "Apply Code Directly"}
                </Button>
              )}
            </div>

            {/* Last Applied Code Result */}
            {lastAppliedCode && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Code Applied Successfully!</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Code:</strong> <code className="font-mono">{lastAppliedCode.code}</code>
                  </p>
                  <p>
                    <strong>Customer:</strong> {lastAppliedCode.user.name} ({lastAppliedCode.user.phone})
                  </p>
                  <p className="flex items-center gap-1">
                    <strong>Discount Applied:</strong>
                    {lastAppliedCode.discountType === "flat" ? (
                      <>
                        <DollarSign className="w-4 h-4" />₹{lastAppliedCode.discountAmount}
                      </>
                    ) : (
                      <>
                        <Percent className="w-4 h-4" />
                        {lastAppliedCode.discountAmount}%
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {lastAppliedCode.user.name}'s reward points have been deducted from their wallet.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applied Codes History */}
        <Card>
          <CardHeader>
            <CardTitle>Applied Codes History</CardTitle>
            <CardDescription>Recently applied customer redeem codes</CardDescription>
          </CardHeader>
          <CardContent>
            {appliedCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No codes applied yet</div>
            ) : (
              <div className="space-y-3">
                {appliedCodes.map((item: any) => (
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorRewardApply;
