import { useState, useEffect } from "react";
import { getPendingUpdateRequestsAPI } from "@/service/operations/vendorProfileUpdateRequest";

export const useVendorNotifications = () => {
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingUpdateRequestsAPI();
      
      if (response && Array.isArray(response)) {
        // Count only pending requests
        const pendingCount = response.filter(
          (request) => request.status === "pending"
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