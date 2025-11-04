import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import axios from "axios";
import { toast } from "react-toastify";

const PurchaseCategories = () => {
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const vendorId = user?._id;
  const [all, setAll] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chooseModeOpen, setChooseModeOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // const base_url= base_url
  const base_url = "http://localhost:8000/api/v1";
  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, [vendorId]);

  const isPurchased = (id: string) => purchased.some((p) => p?._id === id);
  const isPending = (id: string) =>
    pending.some((p) => p?.category?._id === id);

  const openChooseMode = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setChooseModeOpen(true);
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
        toast.success(
          "Cash purchase request sent. Waiting for admin approval."
        );
      } else {
        await handleRazorpayPayment(selectedCategoryId);
      }
      await load();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setChooseModeOpen(false);
      setSelectedCategoryId(null);
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
        key: "rzp_test_lQz64anllWjB83",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Maheshwari Shop",
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
    <div className="p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Purchase Service Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {all.map((c) => (
              <div
                key={c._id}
                className="border rounded-lg p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                {/* Category Info */}
                <div className="mb-4">
                  <div className="text-lg font-medium text-gray-800">
                    {c.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Price: ₹{c.price}
                  </div>
                </div>

                {/* Purchase Status / Button */}
                <div>
                  {isPurchased(c._id) ? (
                    <Button variant="outline" disabled className="w-full">
                      Purchased
                    </Button>
                  ) : isPending(c._id) ? (
                    <Button variant="outline" disabled className="w-full">
                      Pending Approval
                    </Button>
                  ) : (
                    <Button
                      onClick={() => openChooseMode(c._id)}
                      disabled={loading}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      {loading ? "Please wait..." : "Purchase"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Mode Dialog */}
      <Dialog open={chooseModeOpen} onOpenChange={setChooseModeOpen}>
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
            <Button
              variant="outline"
              onClick={() => handlePurchase("cash")}
              disabled={loading}
              className="w-full py-3 text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              Cash (Admin Approval)
            </Button>

            {/* Online / Prepaid Payment */}
            <Button
              onClick={() => handlePurchase("prepaid")}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
            >
              Online Pay ₹
              {all.find((c) => c._id === selectedCategoryId)?.price ?? 0}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseCategories;
