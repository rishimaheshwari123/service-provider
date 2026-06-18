import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Tag, Percent, DollarSign } from "lucide-react";
import { toast } from "react-toastify";
import { validateCouponAPI } from "@/service/operations/coupon";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CouponApplicationProps {
  amount: number;
  onCouponApplied: (couponData: any) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: any;
  categoryId?: string;
  vendorId?: string;
}

const CouponApplication: React.FC<CouponApplicationProps> = ({
  amount,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  categoryId,
  vendorId,
}) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      const validationData = {
        code: couponCode.trim().toUpperCase(),
        amount,
        userId: user?.id,
        categoryId,
        vendorId,
      };

      const response = await validateCouponAPI(validationData, token);
      
      if (response.success) {
        onCouponApplied(response);
        setCouponCode("");
        toast.success("Coupon applied successfully!");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      // Error message is already shown by the API function
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyCoupon();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Apply Coupon</h3>
          </div>

          {!appliedCoupon ? (
            <div className="flex space-x-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="px-6"
              >
                {loading ? "Applying..." : "Apply"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {appliedCoupon.coupon.discountType === "percentage" ? (
                      <Percent className="w-5 h-5 text-green-600" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-semibold text-green-800">
                        {appliedCoupon.coupon.code}
                      </p>
                      <p className="text-sm text-green-600">
                        {appliedCoupon.coupon.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    {appliedCoupon.coupon.discountType === "percentage"
                      ? `${appliedCoupon.coupon.discountValue}% OFF`
                      : `₹${appliedCoupon.coupon.discountValue} OFF`}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Amount:</span>
                  <span>₹{appliedCoupon.originalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Final Amount:</span>
                  <span className="text-green-600">₹{appliedCoupon.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>• Coupons are subject to terms and conditions</p>
            <p>• Only one coupon can be applied per booking</p>
            <p>• Coupon discounts are non-transferable</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponApplication;