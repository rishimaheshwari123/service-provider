import axios from "axios";
import { searchLogs } from "../service/apis";
import { store } from "../redux/store";

interface SearchLogData {
  searchQuery: string;
  category?: string;
  location?: string;
  page: "Home" | "Services";
  resultsCount?: number;
}

export const logSearch = async (data: SearchLogData) => {
  try {
    // Get user info from Redux store
    const state = store.getState();
    const user = state.auth?.user;
    const token = state.auth?.token;
    
    let userId = null;
    let vendorId = null;
    
    if (user && token) {
      // Get user ID
      const id = user._id || user.id;
      
      // Check if it's a vendor or regular user based on role
      if (user.role === "Vendor" || user.role === "vendor") {
        vendorId = id;
      } else {
        // For Admin, User, or any other role
        userId = id;
      }
      
      console.log("Search log - User info:", { 
        role: user.role, 
        userId, 
        vendorId,
        userName: user.name 
      });
    } else {
      console.log("Search log - No user logged in");
    }
    
    // Send log with user/vendor info
    await axios.post(searchLogs.CREATE_LOG_API, {
      ...data,
      userId,
      vendorId,
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error("Failed to log search:", error);
  }
};
