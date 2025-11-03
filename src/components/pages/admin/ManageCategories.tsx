import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategoryAPI, getAllCategoriesAPI, updateCategoryAPI, getCategoryPurchasersAPI, purchaseCategoryAPI } from "@/service/operations/category";
import { getAllVendorAPI } from "@/service/operations/vendor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const ManageCategories = () => {
  const [form, setForm] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [purchasersOpen, setPurchasersOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any | null>(null);
  const [purchasers, setPurchasers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  const load = async () => {
    const data = await getAllCategoriesAPI();
    setCategories(data);
  };

  const openPurchasers = async (category) => {
    setCurrentCategory(category);
    const list = await getCategoryPurchasersAPI(category._id);
    setPurchasers(list);
    setPurchasersOpen(true);
  };

  const openAssignToVendor = async (category) => {
    setCurrentCategory(category);
    if (vendors.length === 0) {
      const all = await getAllVendorAPI();
      setVendors(all);
    }
    setSelectedVendorId("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!currentCategory?._id || !selectedVendorId) return;
    await purchaseCategoryAPI({ vendorId: selectedVendorId, categoryId: currentCategory._id });
    setAssignOpen(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setLoading(true);
    const priceNum = Number(form.price);
    if (editingId) {
      await updateCategoryAPI(editingId, { name: form.name.trim(), price: priceNum });
    } else {
      await createCategoryAPI({ name: form.name.trim(), price: priceNum });
    }
    setForm({ name: "", price: "" });
    setEditingId(null);
    await load();
    setLoading(false);
  };

  return (
    <div className="p-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Category" : "Create Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Plumbing" required />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 499" required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update" : "Create")}</Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ name: "", price: "" }); }}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="divide-y">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">No categories yet.</p>
            ) : (
              categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).map((c) => (
                <div key={c._id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-medium mr-4">{c.name}</span>
                    <span className="text-gray-600">₹{c.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setEditingId(c._id); setForm({ name: c.name, price: String(c.price) }); }}>Edit</Button>
                    <Button size="sm" onClick={() => openPurchasers(c)}>View Purchasers</Button>
                    <Button size="sm" variant="outline" onClick={() => openAssignToVendor(c)}>Assign to Vendor</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={purchasersOpen} onOpenChange={setPurchasersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchasers - {currentCategory?.name}</DialogTitle>
          </DialogHeader>
          {purchasers.length === 0 ? (
            <p className="text-sm text-gray-500">No purchases yet for this category.</p>
          ) : (
            <div className="space-y-2">
              {purchasers.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{p.vendor?.name || "Unknown Vendor"}</p>
                    <p className="text-xs text-gray-500">{p.vendor?.email || p.vendor?.phone || ""}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(p.purchasedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign "{currentCategory?.name}" to Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Select Vendor</Label>
            <Select value={selectedVendorId} onValueChange={(val) => setSelectedVendorId(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v._id} value={v._id}>
                    {v.name} {v.company ? `- ${v.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button disabled={!selectedVendorId} onClick={handleAssign}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCategories;