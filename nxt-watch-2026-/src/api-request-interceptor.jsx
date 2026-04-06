import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// NEW INSTANCE (NO INTERCEPTOR)
const refreshApi = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("Interceptor hit:", error.response?.status);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Calling refresh token API...");

        await refreshApi.get("/access-token-generation"); 

        console.log("Retrying original request...");

        return api(originalRequest);
      } catch (refreshError) {
        console.log("Refresh failed → logout user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
