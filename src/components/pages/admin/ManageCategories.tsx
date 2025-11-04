import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryAPI,
  getAllCategoriesAPI,
  updateCategoryAPI,
  getCategoryPurchasersAPI,
  purchaseCategoryAPI,
  getPendingCategoryPurchasesAPI,
  approveCategoryPurchaseAPI,
  rejectCategoryPurchaseAPI,
} from "@/service/operations/category";
import { getAllVendorAPI } from "@/service/operations/vendor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  if (!user?.isCategoryManage) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }
  const load = async () => {
    const data = await getAllCategoriesAPI();
    setCategories(data);
    const pend = await getPendingCategoryPurchasesAPI();
    setPendingPurchases(pend);
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
    await purchaseCategoryAPI({
      vendorId: selectedVendorId,
      categoryId: currentCategory._id,
    });
    setAssignOpen(false);
  };

  const approve = async (purchaseId: string) => {
    setApprovingId(purchaseId);
    await approveCategoryPurchaseAPI(purchaseId);
    await load();
    setApprovingId(null);
  };

  const reject = async (purchaseId: string) => {
    setRejectingId(purchaseId);
    await rejectCategoryPurchaseAPI(purchaseId);
    await load();
    setRejectingId(null);
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
      await updateCategoryAPI(editingId, {
        name: form.name.trim(),
        price: priceNum,
      });
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
          <CardTitle>
            {editingId ? "Edit Category" : "Create Category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Plumbing"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 499"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update"
                  : "Create"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: "", price: "" });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="categories" className="mt-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="divide-y">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories yet.</p>
                ) : (
                  categories
                    .filter((c) =>
                      c.name.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c._id}
                        className="py-2 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium mr-4">{c.name}</span>
                          <span className="text-gray-600">₹{c.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingId(c._id);
                              setForm({ name: c.name, price: String(c.price) });
                            }}
                          >
                            Edit
                          </Button>
                          <Button size="sm" onClick={() => openPurchasers(c)}>
                            View Purchasers
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignToVendor(c)}
                          >
                            Assign to Vendor
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Cash Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPurchases.length === 0 ? (
                <p className="text-sm text-gray-500">No pending approvals.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Requested At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPurchases.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {p.vendor?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {p.vendor?.email || p.vendor?.phone || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{p.category?.name || "-"}</TableCell>
                        <TableCell>₹{p.category?.price ?? "-"}</TableCell>
                        <TableCell className="capitalize">
                          {p.paymentMode || "cash"}
                        </TableCell>
                        <TableCell>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleString()
                            : p.purchasedAt
                            ? new Date(p.purchasedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => approve(p._id)}
                              disabled={approvingId === p._id}
                            >
                              {" "}
                              {approvingId === p._id
                                ? "Approving..."
                                : "Approve"}{" "}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reject(p._id)}
                              disabled={rejectingId === p._id}
                            >
                              {" "}
                              {rejectingId === p._id
                                ? "Rejecting..."
                                : "Reject"}{" "}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={purchasersOpen} onOpenChange={setPurchasersOpen}>
        <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>
              Purchasers - {currentCategory?.name ?? "Unknown Category"}
            </DialogTitle>
          </DialogHeader>

          {purchasers?.length === 0 ? (
            <p className="text-sm text-gray-500">
              No purchases yet for this category.
            </p>
          ) : (
            <div className="space-y-2">
              {purchasers?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between py-2 px-2 border-b rounded hover:bg-gray-50 transition"
                >
                  {/* Vendor Info */}
                  <div>
                    {p.vendor?.name && (
                      <p className="font-medium">{p.vendor?.name}</p>
                    )}
                    {(p.vendor?.email || p.vendor?.phone) && (
                      <p className="text-xs text-gray-500">
                        {p.vendor?.email ?? p.vendor?.phone}
                      </p>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="mt-1 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
                    {/* Purchased At */}
                    {p.createdAt && (
                      <span className="text-gray-600">
                        {new Date(p.createdAt).toLocaleString()}
                      </span>
                    )}

                    {/* Status Badge */}
                    {p.status && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          p.status === "purchased"
                            ? "bg-green-100 text-green-800"
                            : p.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    )}

                    {/* Payment Mode */}
                    {p.paymentMode && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          p.paymentMode === "prepaid"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.paymentMode.toUpperCase()}
                      </span>
                    )}

                    {/* Transaction ID if online */}
                    {p.paymentMode === "prepaid" && p.transactionId && (
                      <span className="text-gray-500 text-xs">
                        Txn: {p.transactionId}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign "{currentCategory?.name}" to Vendor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Select Vendor</Label>
            <Select
              value={selectedVendorId}
              onValueChange={(val) => setSelectedVendorId(val)}
            >
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
              <Button variant="outline" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!selectedVendorId} onClick={handleAssign}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCategories;
