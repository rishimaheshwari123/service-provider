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
  deleteCategoryAPI,
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
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const ManageCategories = () => {
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [purchasersOpen, setPurchasersOpen] = useState(false);
  const [purchasersLoading, setPurchasersLoading] = useState(false);
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({ 
    name: "", 
    price: "", 
    premiumPrice: "", 
    premiumPlusPrice: "", 
    autoFilled: "" 
  });
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseVendorId, setPurchaseVendorId] = useState<string>("");
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<"cash" | "qr">("cash");
  const [purchaseTransactionId, setPurchaseTransactionId] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  if (!user?.isCategoryManage) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }
  const load = async () => {
    console.log("🔍 ManageCategories: Loading data...");
    setCategoriesLoading(true);
    
    try {
      const data = await getAllCategoriesAPI();
      console.log("📋 Categories loaded:", data?.length || 0);
      setCategories(data);
      
      const pend = await getPendingCategoryPurchasesAPI();
      console.log("⏳ Pending purchases loaded:", pend?.length || 0);
      console.log("📊 Pending purchases data:", pend);
      
      // Debug each pending purchase
      if (pend && pend.length > 0) {
        pend.forEach((purchase, index) => {
          console.log(`Purchase ${index + 1}:`, {
            id: purchase._id,
            vendor: purchase.vendor,
            vendorName: purchase.vendor?.name,
            vendorEmail: purchase.vendor?.email,
            category: purchase.category?.name,
            paymentMode: purchase.paymentMode,
            status: purchase.status,
            createdAt: purchase.createdAt
          });
        });
      }
      
      setPendingPurchases(pend);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const openPurchasers = async (category) => {
    setCurrentCategory(category);
    setPurchasersOpen(true);
    setPurchasersLoading(true);
    
    try {
      const list = await getCategoryPurchasersAPI(category._id);
      setPurchasers(list);
    } finally {
      setPurchasersLoading(false);
    }
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
      toast.error("Please enter Transaction ID for QR payment");
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

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setModalForm({ 
      name: category.name, 
      price: String(category.price), 
      premiumPrice: String(category.premiumPrice || 0),
      premiumPlusPrice: String(category.premiumPlusPrice || 0),
      autoFilled: category.autoFilled || "" 
    });
    setModalImageFile(null);
    setModalImagePreview("");
    setIsEditMode(true);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setModalForm({ 
      name: "", 
      price: "", 
      premiumPrice: "", 
      premiumPlusPrice: "", 
      autoFilled: "" 
    });
    setModalImageFile(null);
    setModalImagePreview("");
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.name || !modalForm.price) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("name", modalForm.name.trim());
    formData.append("price", modalForm.price);
    formData.append("premiumPrice", modalForm.premiumPrice || "0");
    formData.append("premiumPlusPrice", modalForm.premiumPlusPrice || "0");
    if (modalForm.autoFilled) formData.append("autoFilled", modalForm.autoFilled.trim());
    if (modalImageFile) formData.append("image", modalImageFile);
    
    try {
      if (isEditMode && editingCategory?._id) {
        await updateCategoryAPI(editingCategory._id, formData);
      } else {
        await createCategoryAPI(formData);
      }
      
      setModalOpen(false);
      setEditingCategory(null);
      setModalForm({ 
        name: "", 
        price: "", 
        premiumPrice: "", 
        premiumPlusPrice: "", 
        autoFilled: "" 
      });
      setModalImageFile(null);
      setModalImagePreview("");
      setIsEditMode(false);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const handleModalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalImageFile(file);
      setModalImagePreview(URL.createObjectURL(file));
    }
  };

  const clearModalImage = () => {
    setModalImageFile(null);
    setModalImagePreview("");
  };

  const openPurchaseCategory = async (category: any) => {
    setCurrentCategory(category);
    if (vendors.length === 0) {
      const all = await getAllVendorAPI();
      setVendors(all);
    }
    setPurchaseVendorId("");
    setPurchasePaymentMethod("cash");
    setPurchaseTransactionId("");
    setPurchaseOpen(true);
  };

  const handlePurchase = async () => {
    if (!currentCategory?._id || !purchaseVendorId) return;
    if (purchasePaymentMethod === "qr" && !purchaseTransactionId.trim()) {
      toast.error("Please enter Transaction ID for QR payment");
      return;
    }
    await purchaseCategoryAPI({
      vendorId: purchaseVendorId,
      categoryId: currentCategory._id,
      paymentMethod: purchasePaymentMethod,
      transactionId: purchasePaymentMethod === "qr" ? purchaseTransactionId : "",
      assignedByAdmin: true, // Admin purchase kare to direct approve
    });
    setPurchaseOpen(false);
    await load(); // Refresh data
  };

  const openDeleteModal = (category: any) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete?._id) return;
    
    setDeleteLoading(true);
    try {
      const result = await deleteCategoryAPI(categoryToDelete._id);
      if (result) {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        await load(); // Refresh data
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeleteLoading(false);
    }
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

  const toPascalCase = (str) =>
  str
    ?.toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const downloadCategoriesExcel = () => {
    const data = categories.map((category) => ({
      "Category Name": category.name,
      "Auto Filled": category.autoFilled || "",
      "Basic Price": category.price,
      "Premium Price": category.premiumPrice || 0,
      "Premium Plus Price": category.premiumPlusPrice || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    // Auto-size columns
    const colWidths = [
      { wch: 30 }, // Category Name
      { wch: 20 }, // Auto Filled
      { wch: 12 }, // Basic Price
      { wch: 12 }, // Premium Price
      { wch: 15 }, // Premium Plus Price
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "categories.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <div className="flex gap-3">
          <Button 
            onClick={downloadCategoriesExcel} 
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            📥 Download Excel
          </Button>
          <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
            + Add Category
          </Button>
        </div>
      </div>

      <Tabs defaultValue="categories" className="mt-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {pendingPurchases.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingPurchases.length}
              </span>
            )}
          </TabsTrigger>
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
                {categoriesLoading ? (
                  // Simple centered loading spinner
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📂</div>
                    <p className="text-lg font-medium text-gray-600 mb-2">No categories yet</p>
                    <p className="text-sm text-gray-500">Create your first category to get started</p>
                  </div>
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
                            <span className="font-medium mr-2">{toPascalCase(c.name)}</span>
                            {c.autoFilled && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">
                                {c.autoFilled}
                              </span>
                            )}
                            <div className="flex gap-2 mt-1">
                              <span className="text-gray-600 text-sm">Basic: ₹{c.price}</span>
                              {c.premiumPrice > 0 && (
                                <span className="text-orange-600 text-sm">Premium: ₹{c.premiumPrice}</span>
                              )}
                              {c.premiumPlusPrice > 0 && (
                                <span className="text-purple-600 text-sm">Premium+: ₹{c.premiumPlusPrice}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEditModal(c)}
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
                          {/* {user?.role === "admin" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => openPurchaseCategory(c)}
                            >
                              Purchase Category
                            </Button>
                          )} */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteModal(c)}
                          >
                            Delete
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
                      <TableHead>Plan & Price</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Transaction ID</TableHead>
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
                             <span>{toPascalCase(p.vendor?.name || "Unknown")}</span>

                            </span>
                            <span className="text-xs text-gray-500">
                              {p.vendor?.email || p.vendor?.phone || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{p.category?.name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium capitalize">
                              {p.priceTier || "Basic"}
                            </span>
                            <div className="text-sm">
                              {p.discountAmount > 0 ? (
                                <div className="flex flex-col">
                                  <span className="text-gray-500 line-through">
                                    ₹{p.selectedPrice || p.category?.price || "-"}
                                  </span>
                                  <span className="text-green-600 font-medium">
                                    ₹{p.finalPrice || (p.selectedPrice - p.discountAmount) || "-"}
                                  </span>
                                  <span className="text-xs text-green-600">
                                    Saved ₹{p.discountAmount} with coupon
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-600">
                                  ₹{p.finalPrice || p.selectedPrice || p.category?.price || "-"}
                                </span>
                              )}
                            </div>
                            {/* Coupon Information */}
                            {p.couponCode && (
                              <div className="mt-1">
                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                  Coupon: {p.couponCode}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {p.paymentMode || "cash"}
                        </TableCell>
                        <TableCell>
                          {p.paymentMode === "qr" && p.transactionId ? (
                            <div className="flex flex-col">
                              <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded border">
                                {p.transactionId}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
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

          {purchasersLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          ) : purchasers?.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-3">👥</div>
              <p className="text-sm text-gray-500 font-medium">No purchases yet for this category</p>
              <p className="text-xs text-gray-400 mt-1">Purchases will appear here once vendors buy this category</p>
            </div>
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
                    {/* Price Tier & Amount */}
                    {(p.priceTier || p.selectedPrice) && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Plan & Price</span>
                        <span className="font-medium capitalize">
                          {p.priceTier || "Basic"} - ₹{p.finalPrice || p.selectedPrice || "N/A"}
                        </span>
                        {p.discountAmount > 0 && (
                          <span className="text-xs text-green-600">
                            Saved ₹{p.discountAmount} with coupon
                          </span>
                        )}
                      </div>
                    )}

                    {/* Coupon Information */}
                    {p.couponCode && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Coupon Used</span>
                        <span className="font-medium text-purple-600">
                          {p.couponCode}
                        </span>
                      </div>
                    )}

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
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Scan QR code for payment
                  </p>
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-lg inline-block">
                    <img 
                      src="/qr.png" 
                      alt="QR Code for Payment" 
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                </div>
                
                {/* Transaction ID Input */}
                <div className="space-y-2">
                  <Label>Transaction ID <span className="text-red-500">*</span></Label>
                  <input
                    type="text"
                    placeholder="Enter transaction ID"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the transaction ID received after payment
                  </p>
                </div>
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

      {/* Add/Edit Category Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <div>
              <Label htmlFor="modal-name">Category Name (Service Name)</Label>
              <Input
                id="modal-name"
                value={modalForm.name}
                onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                placeholder="e.g. A.C. REPAIRING, ADVOCATE - A"
                required
              />
            </div>
            <div>
              <Label htmlFor="modal-autoFilled">Auto Filled (Parent Category)</Label>
              <Input
                id="modal-autoFilled"
                value={modalForm.autoFilled}
                onChange={(e) => setModalForm({ ...modalForm, autoFilled: e.target.value })}
                placeholder="e.g. Repairing, Legal, Transport, Construction"
              />
              <p className="text-xs text-gray-500 mt-1">This will auto-fill in vendor registration when category is selected</p>
            </div>
            <div>
              <Label htmlFor="modal-price">Basic Price</Label>
              <Input
                id="modal-price"
                value={modalForm.price}
                onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })}
                placeholder="e.g. 499"
                required
              />
            </div>
            <div>
              <Label htmlFor="modal-premium-price">Premium Price</Label>
              <Input
                id="modal-premium-price"
                value={modalForm.premiumPrice}
                onChange={(e) => setModalForm({ ...modalForm, premiumPrice: e.target.value })}
                placeholder="e.g. 799"
              />
            </div>
            <div>
              <Label htmlFor="modal-premium-plus-price">Premium Plus Price</Label>
              <Input
                id="modal-premium-plus-price"
                value={modalForm.premiumPlusPrice}
                onChange={(e) => setModalForm({ ...modalForm, premiumPlusPrice: e.target.value })}
                placeholder="e.g. 999"
              />
            </div>
            <div>
              <Label htmlFor="modal-image">Category Image</Label>
              <Input
                id="modal-image"
                type="file"
                accept="image/*"
                onChange={handleModalImageChange}
                className="cursor-pointer"
              />
              {(modalImagePreview || editingCategory?.image) && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={modalImagePreview || editingCategory?.image}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded border"
                  />
                  {modalImagePreview && (
                    <button
                      type="button"
                      onClick={clearModalImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  setEditingCategory(null);
                  setModalForm({ 
                    name: "", 
                    price: "", 
                    premiumPrice: "", 
                    premiumPlusPrice: "", 
                    autoFilled: "" 
                  });
                  setModalImageFile(null);
                  setModalImagePreview("");
                  setIsEditMode(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase Category Modal */}
      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Purchase "{currentCategory?.name}" for Partner
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Select Partner</Label>

            <Select
              value={purchaseVendorId}
              onValueChange={(val) => setPurchaseVendorId(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a vendor" />
              </SelectTrigger>

              <SelectContent>
                {/* SEARCH BOX */}
                <div className="px-2 pb-2">
                  <input
                    placeholder="Search vendor..."
                    className="w-full px-2 py-1 border rounded text-sm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                {/* ONLY MATCHED RESULTS */}
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

                {/* No results text */}
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
                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${purchasePaymentMethod === "cash" ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-50 border-gray-200"}`}>
                  <input
                    type="radio"
                    name="purchasePaymentMethod"
                    value="cash"
                    checked={purchasePaymentMethod === "cash"}
                    onChange={() => setPurchasePaymentMethod("cash")}
                    className="sr-only"
                  />
                  <span className="font-medium">💵 Cash</span>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${purchasePaymentMethod === "qr" ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-200"}`}>
                  <input
                    type="radio"
                    name="purchasePaymentMethod"
                    value="qr"
                    checked={purchasePaymentMethod === "qr"}
                    onChange={() => setPurchasePaymentMethod("qr")}
                    className="sr-only"
                  />
                  <span className="font-medium">📱 QR</span>
                </label>
              </div>
            </div>

            {/* Transaction ID - Only show for QR */}
            {purchasePaymentMethod === "qr" && (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Scan QR code for payment
                  </p>
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-lg inline-block">
                    <img 
                      src="/qr.png" 
                      alt="QR Code for Payment" 
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                </div>
                
                {/* Transaction ID Input */}
                <div className="space-y-2">
                  <Label>Transaction ID <span className="text-red-500">*</span></Label>
                  <input
                    type="text"
                    placeholder="Enter transaction ID"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={purchaseTransactionId}
                    onChange={(e) => setPurchaseTransactionId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the transaction ID received after payment
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPurchaseOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!purchaseVendorId || (purchasePaymentMethod === "qr" && !purchaseTransactionId.trim())} onClick={handlePurchase}>
                Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
            </p>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. The category will be permanently deleted.
              </p>
              {categoryToDelete && (
                <div className="mt-2 text-xs text-yellow-700">
                  <p><strong>Category:</strong> {categoryToDelete.name}</p>
                  <p><strong>Price:</strong> ₹{categoryToDelete.price}</p>
                  {categoryToDelete.autoFilled && (
                    <p><strong>Type:</strong> {categoryToDelete.autoFilled}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCategories;
