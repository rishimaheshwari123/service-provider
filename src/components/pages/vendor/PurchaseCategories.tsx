import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllCategoriesAPI, getPurchasedCategoriesAPI, purchaseCategoryAPI, getVendorPendingCategoryPurchasesAPI } from "@/service/operations/category";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button as UIButton } from "@/components/ui/button";

const PurchaseCategories = () => {
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const vendorId = user?._id;
  const [all, setAll] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<any[]>([]);
  const [chooseModeOpen, setChooseModeOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const load = async () => {
    const [cats, bought] = await Promise.all([
      getAllCategoriesAPI(),
      vendorId ? getPurchasedCategoriesAPI(vendorId) : Promise.resolve([]),
    ]);
    setAll(cats);
    setPurchased(bought);
    const pend = vendorId ? await getVendorPendingCategoryPurchasesAPI(vendorId) : [];
    setPending(pend);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const isPurchased = (id: string) => purchased.some((p) => p?._id === id);
  const isPending = (id: string) => pending.some((p) => p?.category?._id === id);

  const openChooseMode = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setChooseModeOpen(true);
  };

  const handlePurchase = async (paymentMode: "prepaid" | "cash") => {
    if (!vendorId || !selectedCategoryId) return;
    setLoading(true);
    await purchaseCategoryAPI({ vendorId, categoryId: selectedCategoryId, paymentMode });
    await load();
    setLoading(false);
    setChooseModeOpen(false);
    setSelectedCategoryId(null);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {all.map((c) => (
              <div key={c._id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-600">Price: ₹{c.price}</div>
                </div>
                {isPurchased(c._id) ? (
                  <Button variant="outline" disabled>Purchased</Button>
                ) : isPending(c._id) ? (
                  <Button variant="outline" disabled>Pending Approval</Button>
                ) : (
                  <Button onClick={() => openChooseMode(c._id)} disabled={loading}>{loading ? "Please wait" : "Purchase"}</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={chooseModeOpen} onOpenChange={setChooseModeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Payment Mode</DialogTitle>
          </DialogHeader>
          <div className="flex gap-3">
            <UIButton onClick={() => handlePurchase("prepaid")} disabled={loading}>Prepaid</UIButton>
            <UIButton variant="outline" onClick={() => handlePurchase("cash")} disabled={loading}>Cash (Admin Approval)</UIButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseCategories;