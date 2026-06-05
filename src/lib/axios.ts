import axios from "axios";

/**
 * جلب رابط السيرفر من localStorage أو env
 */
const getBaseURL = () => {
  try {
    //const storedUser = localStorage.getItem("InventoryUser");
    //const inventoryUser = storedUser ? JSON.parse(storedUser) : null;

    return (
      // "http://localhost:5000"
      // inventoryUser?.serverURL ||
      // import.meta.env.VITE_API_BASE_URL ||
      "https://serverinventorydaherserver.onrender.com"
    );
  } catch (error) {
    console.error("Failed to parse InventoryUser:", error);
    return (
      import.meta.env.VITE_API_BASE_URL || "https://serverinventorydaherserver.onrender.com"
    );
  }
};

// ✅ إنشاء axios instance
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// Request interceptor
// =========================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔥 تحديث baseURL في كل طلب (لو تغير المستخدم)
    config.baseURL = getBaseURL();

    return config;
  },
  (error) => Promise.reject(error),
);

// =========================
// Response interceptor
// =========================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
