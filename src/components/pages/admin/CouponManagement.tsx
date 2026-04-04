import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Calendar, Percent, DollarSign, Users, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllCouponsAPI,
  createCouponAPI,
  updateCouponAPI,
  deleteCouponAPI,
  getCouponStatsAPI,
} from "@/service/operations/coupon";

interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
}

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  usedCoupons: number;
  totalDiscountGiven: number;
  totalUsage: number;
}

const CouponManagement = () => {
  const { token , user} = useSelector((state: RootState) => state.auth);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCouponsAPI(token);
      setCoupons(response.coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getCouponStatsAPI(token);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  const handleDeleteCoupon = async (couponId: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCouponAPI(couponId, token);
        fetchCoupons();
        fetchStats();
      } catch (error) {
        console.error("Error deleting coupon:", error);
      }
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    const validFrom = new Date(coupon.validFrom);

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    
    switch (filter) {
      case "active":
        return coupon.isActive && now <= validUntil;
      case "expired":
        return now > validUntil;
      case "inactive":
        return !coupon.isActive;
      default:
        return true;
    }
  });

  if (!user?.isCoupen) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <CouponForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                fetchCoupons();
                fetchStats();
              }}
              token={token}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                  <p className="text-2xl font-bold">{stats.totalCoupons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                  <p className="text-2xl font-bold">{stats.activeCoupons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold">{stats.totalUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Discount</p>
                  <p className="text-2xl font-bold">₹{stats.totalDiscountGiven.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Coupons</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading coupons...</div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No coupons found</div>
          ) : (
            <div className="grid gap-4">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon._id}
                  coupon={coupon}
                  onEdit={setSelectedCoupon}
                  onDelete={handleDeleteCoupon}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {selectedCoupon && (
        <Dialog open={!!selectedCoupon} onOpenChange={() => setSelectedCoupon(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
            </DialogHeader>
            <CouponForm
              coupon={selectedCoupon}
              onSuccess={() => {
                setSelectedCoupon(null);
                fetchCoupons();
                fetchStats();
              }}
              token={token}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
// Coupon Card Component
const CouponCard = ({ coupon, onEdit, onDelete, getStatusBadge }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{coupon.code}</h3>
            {getStatusBadge(coupon)}
          </div>
          <p className="text-gray-600">{coupon.name}</p>
          {coupon.description && (
            <p className="text-sm text-gray-500">{coupon.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              {coupon.discountType === "percentage" ? (
                <Percent className="w-4 h-4" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              <span>
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}% off`
                  : `₹${coupon.discountValue} off`}
              </span>
            </div>
            <div>Used: {coupon.usedCount} times</div>
          </div>
          <div className="text-xs text-gray-500">
            Valid: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(coupon)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(coupon._id)}
            disabled={coupon.usedCount > 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Coupon Form Component
const CouponForm = ({ coupon, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    name: coupon?.name || "",
    description: coupon?.description || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon?.discountValue || "",
    validFrom: coupon?.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : "",
    validUntil: coupon?.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
    isActive: coupon?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
      };

      if (coupon) {
        await updateCouponAPI(coupon._id, submitData, token);
      } else {
        await createCouponAPI(submitData, token);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving coupon:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            required
            disabled={coupon && coupon.usedCount > 0}
          />
        </div>
        <div>
          <Label htmlFor="name">Coupon Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="20% Off Sale"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Get 20% off on all services"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountType">Discount Type *</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value) => setFormData({ ...formData, discountType: value })}
            disabled={coupon && coupon.usedCount > 0}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="flat">Flat Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="discountValue">
            Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
          </Label>
          <Input
            id="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            placeholder={formData.discountType === "percentage" ? "20" : "100"}
            required
            disabled={coupon && coupon.usedCount > 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validFrom">Valid From *</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="validUntil">Valid Until *</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
};

export default CouponManagement;