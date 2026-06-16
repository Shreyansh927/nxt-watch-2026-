import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
  withCredentials: true,
});

// Separate axios instance for refresh token
const refreshApi = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    console.log("Interceptor hit:", error.response?.status);

    if (
      (error.response?.status === 401) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        console.log("Refreshing access token...");

        await refreshApi.get("/access-token-generation");

        console.log("Retrying original request");

        return api(originalRequest);
      } catch (refreshError) {
        console.log("Refresh failed");

        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
