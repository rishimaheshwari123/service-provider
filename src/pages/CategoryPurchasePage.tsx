import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseCategoryAPI, getAllCategoriesAPI } from "@/service/operations/category";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/service/apis";
import { ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";

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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "prepaid" | "qr">("cash");
  const [transactionId, setTransactionId] = useState<string>("");

  const base_url = BASE_URL;

  useEffect(() => {
    console.log("🔍 CategoryPurchasePage: Component loaded");
    console.log("📋 URL Parameters:", {
      vendorId,
      selectedCategoryId,
      vendorName,
      vendorEmail,
      vendorPhone,
      isAdmin
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
        
        const category = categories.find((cat: any) => cat._id === selectedCategoryId);
        console.log("🎯 Found category:", category);
        
        if (category) {
          setSelectedCategory(category);
          console.log("✅ Category set successfully:", category.name);
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
      vendorPhone
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
        };
        
        console.log("📤 API Request Data:", purchaseData);
        
        const result = await purchaseCategoryAPI(purchaseData);
        
        console.log("📥 API Response:", result);
        
        if (result) {
          console.log("✅ Purchase successful, checking vendor purchases...");
          
          // Verify the purchase was created
          try {
            const { getPurchasedCategoriesAPI, getVendorPendingCategoryPurchasesAPI } = await import("@/service/operations/category");
            const [purchased, pending] = await Promise.all([
              getPurchasedCategoriesAPI(vendorId),
              getVendorPendingCategoryPurchasesAPI(vendorId)
            ]);
            
            console.log("📊 Verification Results:");
            console.log("  - Purchased categories:", purchased);
            console.log("  - Pending categories:", pending);
            
            if (paymentMethod === "cash" && pending.length > 0) {
              console.log("✅ Cash payment purchase created successfully - waiting for admin approval");
            } else if (paymentMethod === "qr" && pending.length > 0) {
              console.log("✅ QR payment purchase created successfully - waiting for admin verification");
            } else {
              console.log("⚠️ Warning: Purchase may not have been created properly");
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
        status: error.response?.status
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
      const amount = selectedCategory?.price;
      if (!amount) throw new Error("Category price not found");

      const { data } = await axios.post(`${base_url}/razorpay/capturePayment`, {
        amount,
      });

      if (!data?.order) throw new Error("Failed to initiate payment");

      const options = {
        // key: "rzp_test_lQz64anllWjB83", 
        key: "rzp_live_S4TPRyX5ae0LZA", 
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Niyati Solutions",
        description: `Purchase Category: ${selectedCategory.name}`,
        order_id: data.order.id,
        handler: async (response: any) => {
          try {
            const verifyResponse = await axios.post(
              `${base_url}/razorpay/verifyPayment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                vendorId,
                categoryId: selectedCategoryId,
                paymentMode: "prepaid",
              }
            );
            
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
          contact: vendorPhone || ""
        },
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Required",
              description: "Please complete the payment to continue.",
              variant: "destructive",
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
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
            <CheckCircle className="w-16 h-16 text-green-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Registration Successful!</h1>
              <p className="text-gray-600 mt-2">Welcome to Niyati Solutions</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-xl text-center">
              Complete Your Registration - Purchase Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Hello <span className="font-semibold text-gray-800">{vendorName}</span>! 
                To start receiving service requests, you must purchase your selected category.
              </p>
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Category purchase is required to activate your vendor account
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
                  <div className="text-3xl font-bold text-green-600 mb-3">
                    ₹{selectedCategory.price}
                  </div>
                  {selectedCategory.autoFilled && (
                    <p className="text-sm text-gray-600">
                      Type: {selectedCategory.autoFilled}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-lg text-gray-800">Choose Payment Method:</h4>
              
              <div className="space-y-3">
                <label className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "cash" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value as "cash")}
                    className="text-yellow-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">💵 Cash (Admin Approval)</div>
                    <div className="text-sm text-gray-500">
                      Pay later and get admin approval
                    </div>
                  </div>
                </label>

                <label className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "qr" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={(e) => setPaymentMethod(e.target.value as "qr")}
                    className="text-yellow-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">📱 QR Code Payment</div>
                    <div className="text-sm text-gray-500">
                      Pay via QR and submit transaction ID
                    </div>
                  </div>
                </label>

                <label className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "prepaid" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="prepaid"
                    checked={paymentMethod === "prepaid"}
                    onChange={(e) => setPaymentMethod(e.target.value as "prepaid")}
                    className="text-yellow-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">💳 Online Payment</div>
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
                    Amount: ₹{selectedCategory.price}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the transaction ID you received after making the QR payment
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={handlePurchase}
                disabled={loading || (paymentMethod === "qr" && !transactionId.trim())}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
              >
                {loading 
                  ? "Processing..." 
                  : paymentMethod === "cash" 
                    ? "Submit Purchase Request" 
                    : paymentMethod === "qr"
                      ? "Submit QR Payment"
                      : `Pay ₹${selectedCategory.price} Now`
                }
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
                Complete this step to activate your vendor account and start receiving service requests
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryPurchasePage;