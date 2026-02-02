import { useState, useEffect } from "react";
import { getAllVendorAPI } from "@/service/operations/vendor";

export const useVendorNotifications = () => {
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await getAllVendorAPI();
      
      if (response && Array.isArray(response)) {
        const pendingCount = response.filter(
          (vendor) => vendor.updateProfileRequest === "requested"
        ).length;
        setPendingRequestsCount(pendingCount);
      } else {
        setPendingRequestsCount(0);
      }
    } catch (error) {
      console.error("Error fetching vendor notifications:", error);
      setPendingRequestsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    pendingRequestsCount,
    loading,
    refreshNotifications: fetchPendingRequests,
  };
};