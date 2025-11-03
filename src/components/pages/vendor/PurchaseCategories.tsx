import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllCategoriesAPI, getPurchasedCategoriesAPI, purchaseCategoryAPI } from "@/service/operations/category";

const PurchaseCategories = () => {
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const vendorId = user?._id;
  const [all, setAll] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [cats, bought] = await Promise.all([
      getAllCategoriesAPI(),
      vendorId ? getPurchasedCategoriesAPI(vendorId) : Promise.resolve([]),
    ]);
    setAll(cats);
    setPurchased(bought);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const isPurchased = (id: string) => purchased.some((p) => p?._id === id);

  const handlePurchase = async (categoryId: string) => {
    if (!vendorId) return;
    setLoading(true);
    await purchaseCategoryAPI({ vendorId, categoryId });
    await load();
    setLoading(false);
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
                ) : (
                  <Button onClick={() => handlePurchase(c._id)} disabled={loading}>{loading ? "Please wait" : "Purchase"}</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseCategories;