import axios from "axios";

const API_KEY = "your-secret-api-key-12345"; 
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY, 
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }
    
    // Add API key to all requests (if not already present)
    if (!config.headers["X-API-Key"]) {
      config.headers["X-API-Key"] = API_KEY;
    }
    
    // Add auth token if exists (and not already present)
    if (!config.headers.Authorization) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error("Access denied - Invalid API key or origin");
    }
    return Promise.reject(error);
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: method,
    url: url,
    data: bodyData ? bodyData : null,
    headers: headers ? { ...headers } : undefined, // Merge with interceptor headers
    params: params ? params : null,
  });
};
