import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getAllCategoriesAPI,
  getPurchasedCategoriesAPI,
  purchaseCategoryAPI,
  getVendorPendingCategoryPurchasesAPI,
} from "@/service/operations/category";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BASE_URL } from "@/service/apis";
import axios from "axios";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PurchaseCategories = () => {
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const vendorId = user?._id;
  const [all, setAll] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [chooseModeOpen, setChooseModeOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Use the centralized base URL configuration
  const base_url = BASE_URL;
  const load = async () => {
    setCategoriesLoading(true);
    try {
      const [cats, bought] = await Promise.all([
        getAllCategoriesAPI(),
        vendorId ? getPurchasedCategoriesAPI(vendorId) : Promise.resolve([]),
      ]);
      setAll(cats);
      setPurchased(bought);
      const pend = vendorId
        ? await getVendorPendingCategoryPurchasesAPI(vendorId)
        : [];
      setPending(pend);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [vendorId]);

  const isPurchased = (id: string) => purchased.some((p) => p?._id === id);
  const isPending = (id: string) =>
    pending.some((p) => p?.category?._id === id);

  // Filter categories based on search term
  const filteredCategories = all.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openChooseMode = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setChooseModeOpen(true);
  };

  const closeModals = () => {
    setChooseModeOpen(false);
    setQrModalOpen(false);
    setTransactionId("");
    setSelectedCategoryId(null);
  };

  const handleQrPayment = async () => {
    if (!vendorId || !selectedCategoryId || !transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }

    setLoading(true);
    try {
      await purchaseCategoryAPI({
        vendorId,
        categoryId: selectedCategoryId,
        paymentMode: "qr",
        transactionId: transactionId.trim(),
      });

      closeModals();
      await load();
    } catch (err) {
      console.log(err);
      toast.error("Failed to submit QR payment.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (paymentMode: "prepaid" | "cash") => {
    if (!vendorId || !selectedCategoryId) return;
    setLoading(true);

    try {
      if (paymentMode === "cash") {
        await purchaseCategoryAPI({
          vendorId,
          categoryId: selectedCategoryId,
          paymentMode,
        });
      } else {
        await handleRazorpayPayment(selectedCategoryId);
      }
      await load();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      closeModals();
    }
  };

  const handleRazorpayPayment = async (categoryId: string) => {
    try {
      const amount = all.find((c) => c._id === categoryId)?.price;
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
        name: "Mera GharSansaar",
        description: `Purchase Category`,
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
                categoryId,
                paymentMode: "prepaid",
              }
            );
            if (verifyResponse?.data?.success) {
              toast.success(verifyResponse.data.message);
              load();
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            console.log(err);
            toast.error("Payment verification error");
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#f63b60" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="md:ml-8">
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold flex items-center">
              <span className="mr-3">🛍️</span>
              Purchase Service Categories
            </CardTitle>
            <p className="text-blue-100 mt-2">
              Choose from our available service categories to expand your business offerings
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Search Input */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing results for "{searchTerm}" ({filteredCategories.length} found)
                </p>
              )}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoriesLoading ? (
                // Loading spinner
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Categories...</h3>
                  <p className="text-gray-500">Please wait while we fetch the available categories</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-300 text-8xl mb-6">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchTerm ? "No categories found" : "No categories available"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "Categories will appear here once they are added by the admin."
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="outline"
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                filteredCategories.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
                  >
                    {/* Category Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-6xl text-gray-300">🏢</div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isPurchased(c._id) ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Purchased
                          </span>
                        ) : isPending(c._id) ? (
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            ⏳ Pending
                          </span>
                        ) : (
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      {/* Category Name - Fixed Height */}
                      <div className="mb-3 min-h-[4rem] flex flex-col justify-start">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {c.name}
                        </h3>
                        {c.autoFilled && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium w-fit">
                            {c.autoFilled}
                          </span>
                        )}
                      </div>

                      {/* Price - Fixed Height */}
                      <div className="mb-4 min-h-[3rem] flex items-center">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-gray-500">Price</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{c.price}
                          </span>
                        </div>
                      </div>

                      {/* Purchase Button - Always at bottom */}
                      <div className="mt-auto">
                        {isPurchased(c._id) ? (
                          <Button
                            variant="outline"
                            disabled
                            className="w-full bg-green-50 border-green-200 text-green-700 h-12"
                          >
                            <span className="mr-2">✓</span>
                            Purchased
                          </Button>
                        ) : isPending(c._id) ? (
                          <Button
                            variant="outline"
                            disabled
                            className="w-full bg-yellow-50 border-yellow-200 text-yellow-700 h-12"
                          >
                            <span className="mr-2">⏳</span>
                            Pending Approval
                          </Button>
                        ) : (
                          <Button
                            onClick={() => openChooseMode(c._id)}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold h-12 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Please wait...
                              </>
                            ) : (
                              <>
                                Purchase Now
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Mode Dialog */}
        <Dialog open={chooseModeOpen} onOpenChange={(open) => !open && closeModals()}>
          <DialogContent className="sm:max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Choose Payment Mode
              </DialogTitle>
            </DialogHeader>

            {/* Selected Category Info */}
            <div className="border-b pb-3 mb-4">
              <div className="text-gray-800 font-medium text-lg">
                {all.find((c) => c._id === selectedCategoryId)?.name}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Price: ₹
                {all.find((c) => c._id === selectedCategoryId)?.price ?? 0}
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="flex flex-col gap-4 mt-2">
              {/* Cash Payment */}
              {/* <Button
              variant="outline"
              onClick={() => handlePurchase("cash")}
              disabled={loading}
              className="w-full py-3 text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              Cash (Admin Approval)
            </Button> */}

              {/* Online / Prepaid Payment */}
              <Button
                onClick={() => handlePurchase("prepaid")}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
              >
                Online Pay ₹
                {all.find((c) => c._id === selectedCategoryId)?.price ?? 0}
              </Button>

              {/* QR Code Payment */}
              <Button
                variant="outline"
                onClick={() => setQrModalOpen(true)}
                disabled={loading}
                className="w-full py-3 text-blue-700 border-blue-300 hover:bg-blue-50"
              >
                Pay via QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Code Payment Dialog */}
        <Dialog open={qrModalOpen} onOpenChange={(open) => !open && closeModals()}>
          <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Pay via QR Code
              </DialogTitle>
            </DialogHeader>

            {/* Selected Category Info */}
            <div className="border-b pb-3 mb-4">
              <div className="text-gray-800 font-medium text-lg">
                {all.find((c) => c._id === selectedCategoryId)?.name}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Price: ₹
                {all.find((c) => c._id === selectedCategoryId)?.price ?? 0}
              </div>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan the QR code below to make payment
                </p>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-lg inline-block">
                  <img
                    src="/qr.png"
                    alt="QR Code for Payment"
                    className="w-56 h-56 object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Amount: ₹{all.find((c) => c._id === selectedCategoryId)?.price ?? 0}
                </p>
              </div>

              {/* Transaction ID Input */}
              <div className="w-full mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID *
                </label>
                <Input
                  type="text"
                  placeholder="Enter transaction ID from payment"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the transaction ID you received after making the payment
                </p>
              </div>

              <div className="flex gap-3 w-full mt-4">
                <Button
                  variant="outline"
                  onClick={closeModals}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleQrPayment}
                  disabled={loading || !transactionId.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loading ? "Submitting..." : "Submit Payment"}
                </Button>
              </div>

              <div className="text-center text-xs text-gray-500">
                <p>Payment will be verified by admin before activation</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PurchaseCategories;
