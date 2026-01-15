import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Textarea component for rejection note
import {
  createCategoryAPI,
  getAllCategoriesAPI,
  updateCategoryAPI,
  getCategoryPurchasersAPI,
  purchaseCategoryAPI,
  getPendingCategoryPurchasesAPI,
  approveCategoryPurchaseAPI,
  rejectCategoryPurchaseAPI, // Assume this API is updated to accept a reason
} from "@/service/operations/category";
import { getAllVendorAPI } from "@/service/operations/vendor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Added DialogFooter for button placement
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
  const [form, setForm] = useState({ name: "", price: "", autoFilled: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr">("cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  // 1. New states for rejection dialog
  const [rejectingOpen, setRejectingOpen] = useState(false);
  const [currentRejectPurchaseId, setCurrentRejectPurchaseId] = useState<
    string | null
  >(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false); // State to manage loading on reject submit
  const [searchText, setSearchText] = useState("");

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
    setPaymentMethod("cash");
    setTransactionId("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!currentCategory?._id || !selectedVendorId) return;
    if (paymentMethod === "qr" && !transactionId.trim()) {
      alert("Please enter Transaction ID for QR payment");
      return;
    }
    await purchaseCategoryAPI({
      vendorId: selectedVendorId,
      categoryId: currentCategory._id,
      paymentMethod,
      transactionId: paymentMethod === "qr" ? transactionId : "",
      assignedByAdmin: true, // Admin assign kare to direct approve
    });
    setAssignOpen(false);
    await load(); // Refresh data
  };

  const approve = async (purchaseId: string) => {
    setApprovingId(purchaseId);
    await approveCategoryPurchaseAPI(purchaseId);
    await load();
    setApprovingId(null);
  };

  // 3. Update 'reject' function to open the dialog
  const reject = (purchaseId: string) => {
    setCurrentRejectPurchaseId(purchaseId);
    setRejectReason(""); // Clear previous reason
    setRejectingOpen(true); // Open the dialog
  };

  // 4. New function to handle rejection submission with reason
  const handleRejectSubmit = async () => {
    if (!currentRejectPurchaseId || !rejectReason.trim()) return;

    setIsRejecting(true); // Start loading state for dialog button
    try {
      // 5. Call the rejection API with the purchase ID and the reason (note)
      // Assuming rejectCategoryPurchaseAPI now accepts { purchaseId, reason }
      await rejectCategoryPurchaseAPI(currentRejectPurchaseId, {
        reason: rejectReason.trim(),
      });
      setRejectingOpen(false); // Close dialog on success
      setCurrentRejectPurchaseId(null);
      setRejectReason("");
      await load(); // Reload data
    } catch (error) {
      console.error("Error rejecting purchase:", error);
      // Handle error (e.g., show a toast message)
    } finally {
      setIsRejecting(false); // End loading state
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setLoading(true);
    
    // Create FormData in component like AddBlog does
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("price", form.price);
    if (form.autoFilled) formData.append("autoFilled", form.autoFilled.trim());
    if (imageFile) formData.append("image", imageFile);
    
    if (editingId) {
      await updateCategoryAPI(editingId, formData);
    } else {
      await createCategoryAPI(formData);
    }
    setForm({ name: "", price: "", autoFilled: "" });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    await load();
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
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
              <Label htmlFor="name">Category Name (Service Name)</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. A.C. REPAIRING, ADVOCATE - A"
                required
              />
            </div>
            <div>
              <Label htmlFor="autoFilled">Auto Filled (Parent Category)</Label>
              <Input
                id="autoFilled"
                value={form.autoFilled}
                onChange={(e) => setForm({ ...form, autoFilled: e.target.value })}
                placeholder="e.g. Repairing, Legal, Transport, Construction"
              />
              <p className="text-xs text-gray-500 mt-1">This will auto-fill in vendor registration when category is selected</p>
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
            <div>
              <Label htmlFor="image">Category Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {(imagePreview || (editingId && categories.find(c => c._id === editingId)?.image)) && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={imagePreview || categories.find(c => c._id === editingId)?.image}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded border"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
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
                    setForm({ name: "", price: "", autoFilled: "" });
                    setImageFile(null);
                    setImagePreview("");
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
                        <div className="flex items-center gap-3">
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                          <div>
                            <span className="font-medium mr-2">{c.name}</span>
                            {c.autoFilled && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">
                                {c.autoFilled}
                              </span>
                            )}
                            <span className="text-gray-600">₹{c.price}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingId(c._id);
                              setForm({ name: c.name, price: String(c.price), autoFilled: c.autoFilled || "" });
                              setImageFile(null);
                              setImagePreview("");
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
                            Assign to Partner
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
                      <TableHead>Partner</TableHead>
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
                            {/* Call the updated 'reject' function which opens the dialog */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reject(p._id)} // Opens the dialog
                              disabled={isRejecting} // Disable if any rejection is in progress
                            >
                              Reject
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

      {/* Purchasers Dialog (Existing) */}
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
                    {(p.paymentMode === "prepaid" || p.paymentMode === "qr") && p.transactionId && (
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

      {/* Assign Dialog (Existing) */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign "{currentCategory?.name}" to Partner
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Select Partner</Label>

            <Select
              value={selectedVendorId}
              onValueChange={(val) => setSelectedVendorId(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a vendor" />
              </SelectTrigger>

              <SelectContent>
                {/* ✅ SEARCH BOX */}
                <div className="px-2 pb-2">
                  <input
                    placeholder="Search vendor..."
                    className="w-full px-2 py-1 border rounded text-sm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                {/* ✅ ONLY MATCHED RESULTS */}
                {vendors
                  .filter((v) =>
                    `${v.name} ${v.company ?? ""} ${v.email ?? ""}`
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
                  )
                  .map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.name} {v.company ? `- ${v.company}` : ""} {v.email ? `(${v.email})` : ""}
                    </SelectItem>
                  ))}

                {/* ✅ No results text */}
                {vendors.filter((v) =>
                  `${v.name} ${v.company ?? ""} ${v.email ?? ""}`
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No vendor found
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "cash" ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-50 border-gray-200"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="sr-only"
                  />
                  <span className="font-medium">💵 Cash</span>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "qr" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-200"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                    className="sr-only"
                  />
                  <span className="font-medium">📱 QR</span>
                </label>
              </div>
            </div>

            {/* Transaction ID - Only show for QR */}
            {paymentMethod === "qr" && (
              <div className="space-y-2">
                <Label>Transaction ID <span className="text-red-500">*</span></Label>
                <input
                  type="text"
                  placeholder="Enter transaction ID"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!selectedVendorId || (paymentMethod === "qr" && !transactionId.trim())} onClick={handleAssign}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. New Rejection Dialog */}
      <Dialog open={rejectingOpen} onOpenChange={setRejectingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Purchase Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              कृपया रिजेक्ट करने का कारण दर्ज करें। यह कारण पार्टनर को भेजा
              जाएगा।
              <span className="text-red-500">*</span>
            </p>
            <div>
              <Label htmlFor="reject-reason" className="sr-only">
                Reason for Rejection
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="रिजेक्ट करने का कारण लिखें..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingOpen(false);
                setCurrentRejectPurchaseId(null);
                setRejectReason("");
              }}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || isRejecting}
            >
              {isRejecting ? "Submitting..." : "Submit and Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCategories;
