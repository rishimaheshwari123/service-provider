import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, X, Save } from "lucide-react";
import {
  getKeyFeaturesAPI,
  upsertKeyFeaturesAPI,
} from "@/service/operations/priceKeyFeatures";

const KeyFeaturesTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState({
    price: { features: [] as string[] },
    premiumPrice: { features: [] as string[] },
    premiumPlusPrice: { features: [] as string[] },
  });

  useEffect(() => {
    loadKeyFeatures();
  }, []);

  const loadKeyFeatures = async () => {
    try {
      setLoading(true);
      const data = await getKeyFeaturesAPI();
      setFeatures({
        price: { features: data?.price?.features || [] },
        premiumPrice: { features: data?.premiumPrice?.features || [] },
        premiumPlusPrice: { features: data?.premiumPlusPrice?.features || [] },
      });
    } catch (error) {
      console.error("Error loading key features:", error);
      toast.error("Failed to load key features");
    } finally {
      setLoading(false);
    }
  };

  const addFeature = (type: "price" | "premiumPrice" | "premiumPlusPrice") => {
    setFeatures((prev) => ({
      ...prev,
      [type]: {
        features: [...prev[type].features, ""],
      },
    }));
  };

  const removeFeature = (
    type: "price" | "premiumPrice" | "premiumPlusPrice",
    index: number
  ) => {
    setFeatures((prev) => ({
      ...prev,
      [type]: {
        features: prev[type].features.filter((_, i) => i !== index),
      },
    }));
  };

  const updateFeature = (
    type: "price" | "premiumPrice" | "premiumPlusPrice",
    index: number,
    value: string
  ) => {
    setFeatures((prev) => ({
      ...prev,
      [type]: {
        features: prev[type].features.map((f, i) => (i === index ? value : f)),
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await upsertKeyFeaturesAPI(features);
      toast.success("Key features saved successfully!");
    } catch (error) {
      console.error("Error saving key features:", error);
      toast.error("Failed to save key features");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Price Key Features</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage features for all pricing tiers (applies to all categories)
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Price Features */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Basic Price Features</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addFeature("price")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {features.price.features.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No features added yet
                </p>
              ) : (
                features.price.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        updateFeature("price", index, e.target.value)
                      }
                      placeholder="Enter feature"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFeature("price", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Price Features */}
        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Premium Price Features</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addFeature("premiumPrice")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {features.premiumPrice.features.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No features added yet
                </p>
              ) : (
                features.premiumPrice.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        updateFeature("premiumPrice", index, e.target.value)
                      }
                      placeholder="Enter feature"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFeature("premiumPrice", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Plus Price Features */}
        <Card>
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Premium+ Price Features</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addFeature("premiumPlusPrice")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {features.premiumPlusPrice.features.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No features added yet
                </p>
              ) : (
                features.premiumPlusPrice.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        updateFeature("premiumPlusPrice", index, e.target.value)
                      }
                      placeholder="Enter feature"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFeature("premiumPlusPrice", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeyFeaturesTab;
