import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRewardSettings, updateRewardSettings } from "@/service/operations/rewardAPI";
import { Gift, Percent, DollarSign, Save } from "lucide-react";

const RewardSettings = () => {
  const { token } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    referralPoints: 0,
    referralDiscountType: "flat",
    downloadPoints: 0,
    downloadDiscountType: "flat",
    isActive: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getRewardSettings(token);
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateRewardSettings(token, settings);
      fetchSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="w-8 h-8 text-purple-600" />
          Reward Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure reward points and discount types</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Enable or disable the reward system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Reward System Active
                </Label>
                <p className="text-sm text-gray-500">
                  {settings.isActive ? "System is currently active" : "System is currently inactive"}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={settings.isActive}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, isActive: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Referral Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-600" />
              Referral Rewards
            </CardTitle>
            <CardDescription>
              Points awarded when a user refers another user (both users receive points)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="referralPoints">Referral Points (₹)</Label>
              <Input
                id="referralPoints"
                type="number"
                min="0"
                value={settings.referralPoints}
                onChange={(e) =>
                  setSettings({ ...settings, referralPoints: parseInt(e.target.value) || 0 })
                }
                placeholder="Enter points amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount in rupees that will be credited to both users
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> If set to ₹{settings.referralPoints}, both
                referrer and referred user will receive ₹{settings.referralPoints} as reward points.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Download Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              App Download Rewards
            </CardTitle>
            <CardDescription>
              Points awarded when a user downloads the app from Play Store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="downloadPoints">Download Points (₹)</Label>
              <Input
                id="downloadPoints"
                type="number"
                min="0"
                value={settings.downloadPoints}
                onChange={(e) =>
                  setSettings({ ...settings, downloadPoints: parseInt(e.target.value) || 0 })
                }
                placeholder="Enter points amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount in rupees that will be credited to user on app download
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> Download rewards can only be claimed once per user.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="lg" className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RewardSettings;
