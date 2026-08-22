// frontend/services/api.ts
import axios, { AxiosError } from "axios";

// Determine base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

console.log(`🔗 API Base URL: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Increased timeout
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle Network Error
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error: Cannot reach backend server');
      console.error(`   Attempted URL: ${error.config?.baseURL}${error.config?.url}`);
      console.error('   💡 Solution: Start the backend server with "cd backend && npm run dev"');
      
      // Show alert in browser (for development)
      if (typeof window !== 'undefined') {
        alert('⚠️ Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000');
      }
    } else if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.message || "Something went wrong";
      console.error(`❌ API Error (${error.response.status}):`, message);
    } else if (error.request) {
      console.error("❌ No response from server:", error.request);
    } else {
      console.error("❌ Request Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health', {
      timeout: 3000,
    });
    console.log('✅ Backend is healthy:', response.data);
    return true;
  } catch (error) {
    console.error(error,'❌ Backend is not responding');
    return false;
  }
};

export default api;