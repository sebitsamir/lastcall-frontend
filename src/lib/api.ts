import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { IApiResponse } from "@/types";

// 1. Create the Base Instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
    withCredentials: true, // Critical (allows sending and receiving HttpOnly cookies)
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. Request Interceptor (runs before every request)
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get("accessToken");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// 3. Response Interceptor (runs after every response)
api.interceptors.response.use(
    (response) => response, // If successful, pass data through

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 (Unauthorized) and we haven't tried to refresh it yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried to prevent infinite loops

            try {
                // Silently ask the backend for a new token using the HttpOnly cookie
                const refreshResponse = await axios.post<IApiResponse<{ accessToken: string }>> (
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                    {}, // Empty body, the cookie is sent automatically via withCredentials
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data.data.accessToken;
                Cookies.set("accessToken", newAccessToken, { expires: 1 }); // Save for 1 day

                // Retry the original failed request with the new token in the header
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return api(originalRequest);
            } 
            catch (refreshError){
                // Refresh failed: User is truly logged out. Clear cookies and redirect to login
                Cookies.remove("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        // For all other errors (404, 500, etc)
        return Promise.reject(error);
    }
);

export default api;