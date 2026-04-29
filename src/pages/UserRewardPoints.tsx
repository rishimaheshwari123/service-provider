import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getUserRewardPoints,
  getUserRewardHistory,
  generateRedeemCode,
  getUserRedeemCodes,
} from "@/service/operations/rewardAPI";
import {
  Gift,
  TrendingUp,
  Users,
  Clock,
  Copy,
  CheckCircle,
  XCircle,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { BASE_URL } from "@/service/apis";

const UserRewardPoints = () => {
  const { token, user } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [rewardPoints, setRewardPoints] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [redeemCodes, setRedeemCodes] = useState<any[]>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [generatedCode, setGeneratedCode] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchRewardPoints();
      fetchHistory();
      fetchRedeemCodes();
    }
  }, [token]);

  const fetchRewardPoints = async () => {
    try {
      const response = await getUserRewardPoints(token);
      if (response.success) {
        setRewardPoints(response.data);
      }
    } catch (error) {
      console.error("Error fetching reward points:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await getUserRewardHistory(token, 1, 20);
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchRedeemCodes = async () => {
    try {
      const response = await getUserRedeemCodes(token);
      if (response.success) {
        setRedeemCodes(response.data);
      }
    } catch (error) {
      console.error("Error fetching redeem codes:", error);
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(pointsToRedeem);

    if (!points || points <= 0) {
      toast.error("Please enter valid points");
      return;
    }

    if (points > rewardPoints?.availablePoints) {
      toast.error("Insufficient reward points");
      return;
    }

    try {
      setLoading(true);
      const response = await generateRedeemCode(token, points);
      if (response.success) {
        setGeneratedCode(response.data);
        setPointsToRedeem("");
        fetchRewardPoints();
        fetchRedeemCodes();
      }
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const copyReferralCode = () => {
    if (rewardPoints?.userId?.referralCode) {
      copyToClipboard(rewardPoints.userId.referralCode);
    }
  };

  const handleGenerateReferralCode = async () => {
    try {
      setLoading(true);
      // Call backend API to generate referral code for existing user
      const response = await fetch(`${BASE_URL}/auth/generate-referral-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id, // Send user ID from redux
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Referral code generated successfully!");
        fetchRewardPoints(); // Refresh data
      } else {
        toast.error(data.message || "Failed to generate referral code");
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
      toast.error("Failed to generate referral code");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: "default",
      used: "secondary",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  const getTypeColor = (type: string) => {
    return type === "credit" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto px-2">
        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-600" />
                <span className="text-3xl font-bold">{rewardPoints?.totalPoints || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-3xl font-bold">{rewardPoints?.availablePoints || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {rewardPoints?.usedPoints || 0} points used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-3xl font-bold">{rewardPoints?.referralCount || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Friends referred</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Your Referral Code
            </CardTitle>
            <CardDescription>Share this code with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {rewardPoints?.userId?.referralCode ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <code className="bg-purple-100 text-purple-800 px-4 py-3 rounded-lg font-mono text-xl font-bold block text-center">
                      {rewardPoints.userId.referralCode}
                    </code>
                  </div>
                  <Button onClick={copyReferralCode} variant="outline" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  When someone signs up using your code, both of you will receive reward points!
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  You don't have a referral code yet. Generate one to start earning rewards!
                </p>
                <Button 
                  onClick={handleGenerateReferralCode} 
                  disabled={loading}
                  className="gap-2"
                >
                  <Gift className="w-4 h-4" />
                  {loading ? "Generating..." : "Generate Referral Code"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Redeem Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Redeem Your Points</CardTitle>
            <CardDescription>
              Generate a code to use your points with vendors (valid for 30 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsGenerateDialogOpen(true)}
              disabled={!rewardPoints?.availablePoints || rewardPoints.availablePoints === 0}
              className="gap-2"
            >
              <Gift className="w-4 h-4" />
              Generate Redeem Code
            </Button>
          </CardContent>
        </Card>

        {/* Active Redeem Codes */}
        {redeemCodes.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Redeem Codes</CardTitle>
              <CardDescription>Active and recent redeem codes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {redeemCodes.slice(0, 5).map((code: any) => (
                  <div
                    key={code._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <code className="bg-gray-100 px-3 py-2 rounded font-mono font-bold">
                        {code.code}
                      </code>
                      <div>
                        <p className="font-medium">{code.points} points</p>
                        <p className="text-sm text-gray-500">
                          {code.discountType === "flat" ? "₹" : ""}
                          {code.discountAmount}
                          {code.discountType === "percentage" ? "%" : ""} discount
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {code.status === "active" && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          Expires: {format(new Date(code.expiresAt), "HH:mm")}
                        </div>
                      )}
                      {getStatusBadge(code.status)}
                      {code.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referred Users */}
        {rewardPoints?.referredUsers && rewardPoints.referredUsers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Referred Friends</CardTitle>
              <CardDescription>People who joined using your referral code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rewardPoints.referredUsers.map((user: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+{user.pointsEarned} points</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(user.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reward History */}
        <Card>
          <CardHeader>
            <CardTitle>Reward History</CardTitle>
            <CardDescription>Your points earning and spending history</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No history yet</div>
            ) : (
              <div className="space-y-2">
                {history.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === "credit" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-500 capitalize">{item.source}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTypeColor(item.type)}`}>
                        {item.type === "credit" ? "+" : "-"}
                        {item.points}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generate Code Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Redeem Code</DialogTitle>
            <DialogDescription>
              Enter the number of points you want to redeem (Available:{" "}
              {rewardPoints?.availablePoints || 0})
            </DialogDescription>
          </DialogHeader>

          {generatedCode ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Your Redeem Code</p>
                <code className="bg-white px-4 py-3 rounded font-mono text-2xl font-bold block">
                  {generatedCode.code}
                </code>
                <Button
                  onClick={() => copyToClipboard(generatedCode.code)}
                  variant="outline"
                  className="mt-3 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Points:</strong> {generatedCode.points}
                </p>
                <p>
                  <strong>Discount:</strong> {generatedCode.discountType === "flat" ? "₹" : ""}
                  {generatedCode.discountAmount}
                  {generatedCode.discountType === "percentage" ? "%" : ""}
                </p>
                <p>
                  <strong>Expires:</strong> {format(new Date(generatedCode.expiresAt), "PPpp")}
                </p>
                <p className="text-orange-600">
                  ⚠️ This code is valid for 30 minutes only!
                </p>
              </div>
              <Button
                onClick={() => {
                  setGeneratedCode(null);
                  setIsGenerateDialogOpen(false);
                }}
                className="w-full"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGenerateCode} className="space-y-4">
              <div>
                <Label htmlFor="points">Points to Redeem</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max={rewardPoints?.availablePoints || 0}
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  placeholder="Enter points"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenerateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Generating..." : "Generate Code"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRewardPoints;
