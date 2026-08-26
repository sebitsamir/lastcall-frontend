// src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

// PRODUCTION-SAFE: No silent localhost fallback
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api/v1"
        : undefined);

if (!API_BASE_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL is not configured. Set it in your environment variables (Vercel dashboard for production, .env.local for development)."
    );
}

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // For httpOnly cookies if you use them
});

// REQUEST INTERCEPTOR: Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("accessToken");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only set JSON if it's not already FormData/multipart
        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Auto-refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get("refreshToken");
                if (!refreshToken) {
                    // No refresh token — force logout
                    Cookies.remove("accessToken");
                    Cookies.remove("refreshToken");
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const payload = (data.data ?? data) as Record<string, unknown>;
                const newAccessToken = payload.accessToken as string;
                const newRefreshToken = payload.refreshToken as string | undefined;

                // Store new tokens
                Cookies.set("accessToken", newAccessToken);
                if (newRefreshToken) Cookies.set("refreshToken", newRefreshToken);

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — force logout
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                toast.error("Session expired. Please sign in again.");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;