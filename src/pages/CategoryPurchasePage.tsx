import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  purchaseCategoryAPI,
  getAllCategoriesAPI,
  getPurchasedCategoriesAPI,
} from "@/service/operations/category";
import { getKeyFeaturesAPI } from "@/service/operations/priceKeyFeatures";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/service/apis";
import { ArrowLeft, CheckCircle, Info, X } from "lucide-react";
import { validateCouponAPI } from "@/service/operations/coupon";
import { capturePaymentAPI, verifyPaymentAPI } from "@/service/operations/razorpay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CategoryPurchasePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get parameters from URL
  const vendorId = searchParams.get("vendorId");
  const selectedCategoryId = searchParams.get("categoryId");
  const vendorName = searchParams.get("vendorName");
  const vendorEmail = searchParams.get("vendorEmail");
  const vendorPhone = searchParams.get("vendorPhone");
  const isAdmin = searchParams.get("isAdmin") === "true"; // Check if this is an admin registration

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedPriceTier, setSelectedPriceTier] = useState<"basic" | "premium" | "premiumPlus">("basic");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "prepaid" | "qr">(
    isAdmin ? "cash" : "qr", // Default to QR for regular vendors, cash for admin
  );
  const [transactionId, setTransactionId] = useState<string>("");

  // Key Features Modal states
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [keyFeatures, setKeyFeatures] = useState<any>(null);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string>("");

  const base_url = BASE_URL;

  // Get current price based on selected tier
  const getCurrentPrice = () => {
    if (!selectedCategory) return 0;
    switch (selectedPriceTier) {
      case "premium":
        return selectedCategory.premiumPrice || selectedCategory.price;
      case "premiumPlus":
        return selectedCategory.premiumPlusPrice || selectedCategory.price;
      default:
        return selectedCategory.price;
    }
  };

  // Get final price after coupon discount
  const getFinalPrice = () => {
    const originalPrice = getCurrentPrice();
    if (appliedCoupon) {
      return originalPrice - appliedCoupon.discountAmount;
    }
    return originalPrice;
  };

  // Validate and apply coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const data = await validateCouponAPI({
        code: couponCode.trim(),
        amount: getCurrentPrice(),
        userId: vendorId,
        categoryId: selectedCategory._id,
        vendorId: vendorId,
      });

      if (data && data.success) {
        setAppliedCoupon({
          ...data.coupon,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
          originalAmount: data.originalAmount,
        });
        toast({
          title: "Coupon Applied!",
          description: `You saved ₹${data.discountAmount} with coupon ${data.coupon.code}`,
        });
      } else {
        setCouponError(data?.message || "Invalid coupon code");
      }
    } catch (error: any) {
      console.error("Error validating coupon:", error);
      setCouponError(error?.response?.data?.message || "Failed to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order",
    });
  };

  // Load key features and open modal
  const loadKeyFeatures = async () => {
    try {
      setFeaturesLoading(true);
      setShowFeaturesModal(true);
      const features = await getKeyFeaturesAPI();
      setKeyFeatures(features);
    } catch (error) {
      console.error("Error loading key features:", error);
      toast({
        title: "Error",
        description: "Failed to load key features",
        variant: "destructive",
      });
    } finally {
      setFeaturesLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔍 CategoryPurchasePage: Component loaded");
    console.log("📋 URL Parameters:", {
      vendorId,
      selectedCategoryId,
      vendorName,
      vendorEmail,
      vendorPhone,
      isAdmin,
    });

    // Redirect if required parameters are missing
    if (!vendorId || !selectedCategoryId) {
      console.log("❌ Missing required parameters, redirecting to login");
      toast({
        title: "Error",
        description: "Missing required information. Redirecting to login.",
        variant: "destructive",
      });
      navigate(isAdmin ? "/admin/vendors" : "/partner/login");
      return;
    }

    const fetchCategoryDetails = async () => {
      try {
        console.log("📤 Fetching category details for ID:", selectedCategoryId);
        const categories = await getAllCategoriesAPI();
        console.log("📥 All categories received:", categories?.length || 0);

        const category = categories.find(
          (cat: any) => cat._id === selectedCategoryId,
        );
        console.log("🎯 Found category:", category);

        if (category) {
          setSelectedCategory(category);
          console.log("✅ Category set successfully:", category.name);

          // Check if vendor already purchased this category and get their price tier
          try {
            console.log("🔍 Checking vendor's existing purchases...");
            const purchasedCategories = await getPurchasedCategoriesAPI(vendorId);
            console.log("📥 Vendor's purchased categories:", purchasedCategories);

            const existingPurchase = purchasedCategories.find(
              (purchase: any) => {
                console.log("🔍 Checking purchase:", {
                  purchaseId: purchase._id,
                  categoryId: purchase.category?._id || purchase.category,
                  selectedCategoryId,
                  priceTier: purchase.priceTier
                });
                return purchase.category?._id === selectedCategoryId || purchase.category === selectedCategoryId;
              }
            );

            if (existingPurchase) {
              console.log("🎯 Found existing purchase:", existingPurchase);
              // Set the price tier from existing purchase
              const existingTier = existingPurchase.priceTier || "basic";
              console.log("💰 Setting price tier from existing purchase:", existingTier);
              setSelectedPriceTier(existingTier);
            } else {
              console.log("📝 No existing purchase found, checking vendor's registration preference...");
              // If no existing purchase, try to get vendor's registration preference
              try {
                const { getVendorByIdAPI } = await import("@/service/operations/vendor");
                const vendorData = await getVendorByIdAPI(vendorId);
                console.log("👤 Vendor data:", vendorData);

                if (vendorData && vendorData.selectedPriceTier && vendorData.category === selectedCategoryId) {
                  console.log("💰 Setting price tier from vendor registration:", vendorData.selectedPriceTier);
                  setSelectedPriceTier(vendorData.selectedPriceTier);
                } else {
                  console.log("📝 Using default basic tier");
                }
              } catch (vendorError) {
                console.error("❌ Error fetching vendor data:", vendorError);
                console.log("📝 Using default basic tier");
              }
            }
          } catch (purchaseError) {
            console.error("❌ Error checking existing purchases:", purchaseError);
            // Continue with default basic tier if error
          }
        } else {
          console.log("❌ Category not found for ID:", selectedCategoryId);
          toast({
            title: "Error",
            description: "Category not found. Redirecting to login.",
            variant: "destructive",
          });
          navigate(isAdmin ? "/admin/vendors" : "/partner/login");
        }
      } catch (error) {
        console.error("❌ Error fetching category details:", error);
        toast({
          title: "Error",
          description: "Failed to load category details.",
          variant: "destructive",
        });
      }
    };

    fetchCategoryDetails();
  }, [vendorId, selectedCategoryId, navigate, toast]);

  const handlePurchase = async () => {
    if (!vendorId || !selectedCategoryId) return;

    console.log("🔍 DEBUG: Starting purchase process");
    console.log("📋 Purchase Data:", {
      vendorId,
      selectedCategoryId,
      paymentMethod,
      vendorName,
      vendorEmail,
      vendorPhone,
    });

    // Validate QR payment
    if (paymentMethod === "qr" && !transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter Transaction ID for QR payment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "cash" || paymentMethod === "qr") {
        console.log("💰 Sending purchase request to API...");

        const purchaseData = {
          vendorId,
          categoryId: selectedCategoryId,
          paymentMethod,
          transactionId: paymentMethod === "qr" ? transactionId : "",
          assignedByAdmin: isAdmin, // Set to true if admin registration
          status: "purchased", // For admin registrations, always set as purchased
          isAdmin, // Pass the isAdmin flag
          priceTier: selectedPriceTier, // Include selected price tier
          selectedPrice: getCurrentPrice(), // Include original price
          finalPrice: getFinalPrice(), // Include final price after discount
          // Coupon information
          couponCode: appliedCoupon?.code || null,
          couponId: appliedCoupon?.id || null,
          discountAmount: appliedCoupon?.discountAmount || 0,
        };

        console.log("📤 API Request Data:", purchaseData);

        const result = await purchaseCategoryAPI(purchaseData);

        console.log("📥 API Response:", result);

        if (result) {
          console.log("✅ Purchase successful, checking vendor purchases...");

          // Verify the purchase was created
          try {
            const {
              getPurchasedCategoriesAPI,
              getVendorPendingCategoryPurchasesAPI,
            } = await import("@/service/operations/category");
            const [purchased, pending] = await Promise.all([
              getPurchasedCategoriesAPI(vendorId),
              getVendorPendingCategoryPurchasesAPI(vendorId),
            ]);

            console.log("📊 Verification Results:");
            console.log("  - Purchased categories:", purchased);
            console.log("  - Pending categories:", pending);

            if (paymentMethod === "cash" && pending.length > 0) {
              console.log(
                "✅ Cash payment purchase created successfully - waiting for admin approval",
              );
            } else if (paymentMethod === "qr" && pending.length > 0) {
              console.log(
                "✅ QR payment purchase created successfully - waiting for admin verification",
              );
            } else {
              console.log(
                "⚠️ Warning: Purchase may not have been created properly",
              );
            }
          } catch (verifyError) {
            console.error("❌ Error verifying purchase:", verifyError);
          }

          toast({
            title: "Success",
            description: isAdmin
              ? "Category assigned successfully!"
              : paymentMethod === "cash"
                ? "Category purchase request submitted! Waiting for admin approval."
                : "QR payment submitted! Waiting for admin verification.",
          });
          navigate(isAdmin ? "/admin/vendors" : "/partner/login");
        } else {
          console.log("❌ Purchase failed - no result returned");
        }
      } else {
        console.log("💳 Processing online payment...");
        await handleRazorpayPayment();
      }
    } catch (error) {
      console.error("❌ Purchase Error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      toast({
        title: "Error",
        description: "Failed to purchase category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const amount = getFinalPrice(); // Use final price after discount
      if (!amount) throw new Error("Category price not found");

      const data = await capturePaymentAPI(amount);

      if (!data?.order) throw new Error("Failed to initiate payment");

      const options = {
        // key: "rzp_test_SzRBgNqSTAHvYZ",
        key: "rzp_live_S4TPRyX5ae0LZA",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Niyati Solutions",
        description: `Purchase Category: ${selectedCategory.name}`,
        order_id: data.order.id,
        handler: async (response: any) => {
          try {
            const verifyResponse = await verifyPaymentAPI({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              vendorId,
              categoryId: selectedCategoryId,
              paymentMode: "prepaid",
              priceTier: selectedPriceTier,
              selectedPrice: getCurrentPrice(),
              finalPrice: getFinalPrice(),
              couponCode: appliedCoupon?.code || null,
              couponId: appliedCoupon?.id || null,
              discountAmount: appliedCoupon?.discountAmount || 0,
            });

            if (verifyResponse?.data?.success) {
              toast({
                title: "Success",
                description: "Category purchased successfully!",
              });
              navigate(isAdmin ? "/admin/vendors" : "/partner/login");
            } else {
              toast({
                title: "Error",
                description: "Payment verification failed.",
                variant: "destructive",
              });
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            toast({
              title: "Error",
              description: "Payment verification error",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: vendorName || "",
          email: vendorEmail || "",
          contact: vendorPhone || "",
        },
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Required",
              description: "Please complete the payment to continue.",
              variant: "destructive",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {/* <CheckCircle className="w-16 h-16 text-green-500 mr-4" /> */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Partner Registration
              </h1>
              {/* <p className="text-gray-600 mt-2">Welcome to Niyati Solutions</p> */}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-xl text-center">
              Please Pay To Complete The Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Hello{" "}
                <span className="font-semibold text-gray-800">
                  {vendorName}
                </span>
                ! To start receiving service requests, you must purchase your
                selected category.
              </p>
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Category purchase is required to activate your vendor
                  account
                </p>
              </div>
            </div>

            {/* Category Details Card */}
            <Card className="border-2 border-yellow-200 bg-yellow-50 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-xl text-gray-800 mb-3">
                    {selectedCategory.name}
                  </h3>

                  {/* Pricing Tiers */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-gray-700">Select Plan:</h4>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {/* Basic Plan */}
                      <label className={`flex-1 max-w-xs p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedPriceTier === "basic"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <input
                          type="radio"
                          name="priceTier"
                          value="basic"
                          checked={selectedPriceTier === "basic"}
                          onChange={() => setSelectedPriceTier("basic")}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-semibold">Basic</div>
                          <div className="text-lg font-bold">₹{selectedCategory.price}</div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedPriceTier("basic");
                              loadKeyFeatures();
                            }}
                            className="mt-2 text-xs text-blue-600 hover:underline"
                          >
                            View Details
                          </button>
                        </div>
                      </label>

                      {/* Premium Plan */}
                      {selectedCategory.premiumPrice > 0 && (
                        <label className={`flex-1 max-w-xs p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedPriceTier === "premium"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300"
                          }`}>
                          <input
                            type="radio"
                            name="priceTier"
                            value="premium"
                            checked={selectedPriceTier === "premium"}
                            onChange={() => setSelectedPriceTier("premium")}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="font-semibold">Premium</div>
                            <div className="text-lg font-bold">₹{selectedCategory.premiumPrice}</div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedPriceTier("premium");
                                loadKeyFeatures();
                              }}
                              className="mt-2 text-xs text-orange-600 hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                        </label>
                      )}

                      {/* Premium Plus Plan */}
                      {selectedCategory.premiumPlusPrice > 0 && (
                        <label className={`flex-1 max-w-xs p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedPriceTier === "premiumPlus"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                          }`}>
                          <input
                            type="radio"
                            name="priceTier"
                            value="premiumPlus"
                            checked={selectedPriceTier === "premiumPlus"}
                            onChange={() => setSelectedPriceTier("premiumPlus")}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="font-semibold">Premium Plus</div>
                            <div className="text-lg font-bold">₹{selectedCategory.premiumPlusPrice}</div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedPriceTier("premiumPlus");
                                loadKeyFeatures();
                              }}
                              className="mt-2 text-xs text-purple-600 hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-green-600 mb-3">
                    Selected: ₹{getCurrentPrice()}
                  </div>
                  {appliedCoupon && (
                    <div className="text-lg text-red-600 mb-2">
                      Discount: -₹{appliedCoupon.discountAmount}
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="text-2xl font-bold text-blue-600 mb-3">
                      Final Price: ₹{getFinalPrice()}
                    </div>
                  )}
                  {selectedCategory.autoFilled && (
                    <p className="text-sm text-gray-600">
                      Type: {selectedCategory.autoFilled}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card className="border-2 border-purple-200 bg-purple-50 mb-6">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg text-gray-800 mb-4">
                  Have a Coupon Code?
                </h4>

                {!appliedCoupon ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={couponLoading}
                      />
                      <Button
                        onClick={validateCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                      >
                        {couponLoading ? "Validating..." : "Apply"}
                      </Button>
                    </div>

                    {couponError && (
                      <div className="text-red-600 text-sm">
                        {couponError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">
                            Coupon Applied: {appliedCoupon.code}
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {appliedCoupon.name} - You saved ₹{appliedCoupon.discountAmount}
                        </p>
                      </div>
                      <Button
                        onClick={removeCoupon}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-lg text-gray-800">
                Choose Payment Method:
              </h4>

              <div className="space-y-3">
                {/* Cash option - Only show for admin registrations */}
                {isAdmin && (
                  <label
                    className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "cash"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "cash")
                      }
                      className="text-yellow-500 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-lg">
                        💵 Cash (Admin Approval)
                      </div>
                      <div className="text-sm text-gray-500">
                        Pay later and get admin approval
                      </div>
                    </div>
                  </label>
                )}

                {/* QR Code Payment - Always available */}
                <label
                  className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "qr"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={(e) => setPaymentMethod(e.target.value as "qr")}
                    className="text-blue-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">
                      📱 QR Code Payment
                    </div>
                    <div className="text-sm text-gray-500">
                      Pay via QR and submit transaction ID (Requires admin approval)
                    </div>
                  </div>
                </label>

                {/* Online Payment - Always available */}
                <label
                  className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "prepaid"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="prepaid"
                    checked={paymentMethod === "prepaid"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "prepaid")
                    }
                    className="text-green-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">💳 Online Payment (Razorpay)</div>
                    <div className="text-sm text-gray-500">
                      Pay now and get instant access
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* QR Code Display and Transaction ID - Only show for QR */}
            {paymentMethod === "qr" && (
              <div className="space-y-4 mb-6">
                {/* Information Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">QR Payment Process:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Scan the QR code and make payment</li>
                        <li>Enter the transaction ID you receive</li>
                        <li>Submit for admin verification</li>
                        <li>Your service will be activated after approval</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    Scan the QR code below to make payment
                  </p>
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg inline-block">
                    <img
                      src="/qr.png"
                      alt="QR Code for Payment"
                      className="w-72 h-72 object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-medium">
                    Amount: ₹{getFinalPrice()}
                  </p>
                </div>

                {/* Transaction ID Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from QR payment"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the transaction ID you received after making the QR
                    payment. This will be verified by our admin team.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={handlePurchase}
                disabled={
                  loading || (paymentMethod === "qr" && !transactionId.trim())
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
              >
                {loading
                  ? "Processing..."
                  : paymentMethod === "cash"
                    ? "Submit Purchase Request"
                    : paymentMethod === "qr"
                      ? "Submit QR Payment (Pending Approval)"
                      : `Pay ₹${getFinalPrice()} Now`}
              </Button>
              {/* 
              <Button
                variant="outline"
                onClick={() => navigate(isAdmin ? "/admin/vendors" : "/partner/login")}
                disabled={loading}
                className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {isAdmin ? "Back to Admin Panel" : "Go to Login"}
              </Button>
 */}
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Complete this step to activate your vendor account and start
                receiving service requests
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Features Modal */}
        <Dialog open={showFeaturesModal} onOpenChange={setShowFeaturesModal}>
          <DialogContent className="max-w-md max-h-[600px] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {selectedPriceTier === "basic" && "Basic Plan Features"}
                {selectedPriceTier === "premium" && "Premium Plan Features"}
                {selectedPriceTier === "premiumPlus" && "Premium Plus Plan Features"}
              </DialogTitle>
            </DialogHeader>

            {featuresLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading features...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {/* Selected Plan Features */}
                <div className={`border-2 rounded-lg p-6 ${selectedPriceTier === "basic" ? "border-blue-200 bg-blue-50" :
                  selectedPriceTier === "premium" ? "border-orange-200 bg-orange-50" :
                    "border-purple-200 bg-purple-50"
                  }`}>
                  <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold ${selectedPriceTier === "basic" ? "text-blue-700" :
                      selectedPriceTier === "premium" ? "text-orange-700" :
                        "text-purple-700"
                      }`}>
                      {selectedPriceTier === "basic" && "Basic Plan"}
                      {selectedPriceTier === "premium" && "Premium Plan"}
                      {selectedPriceTier === "premiumPlus" && "Premium Plus Plan"}
                    </h3>
                    <p className={`text-3xl font-bold mt-2 ${selectedPriceTier === "basic" ? "text-blue-900" :
                      selectedPriceTier === "premium" ? "text-orange-900" :
                        "text-purple-900"
                      }`}>
                      ₹{selectedPriceTier === "basic" ? selectedCategory?.price :
                        selectedPriceTier === "premium" ? selectedCategory?.premiumPrice :
                          selectedCategory?.premiumPlusPrice || 0}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedPriceTier === "basic" && keyFeatures?.price?.features?.length > 0 ? (
                      keyFeatures.price.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : selectedPriceTier === "premium" && keyFeatures?.premiumPrice?.features?.length > 0 ? (
                      keyFeatures.premiumPrice.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : selectedPriceTier === "premiumPlus" && keyFeatures?.premiumPlusPrice?.features?.length > 0 ? (
                      keyFeatures.premiumPlusPrice.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No features added yet for this plan
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center py-4 border-t">
              <Button
                onClick={() => setShowFeaturesModal(false)}
                variant="outline"
                className="px-8"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CategoryPurchasePage;
