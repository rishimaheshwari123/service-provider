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
    
    // Remove Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    // Remove Content-Type for requests without body (GET, DELETE without data)
    else if (!config.data || (config.method && ['get', 'delete'].includes(config.method.toLowerCase()))) {
      delete config.headers["Content-Type"];
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
  const config = {
    method: method,
    url: url,
    data: bodyData ? bodyData : null,
    headers: headers ? { ...headers } : undefined,
    params: params ? params : null,
  };

  // For DELETE requests without body, don't set data field at all
  if (method === 'DELETE' && !bodyData) {
    delete config.data;
  }

  return axiosInstance(config);
};
