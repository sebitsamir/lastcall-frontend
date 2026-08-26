import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { IApiResponse } from "@/types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// 1. Create the Base Instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Critical (allows sending and receiving HttpOnly cookies)
});

const isAuthCredentialRequest = (url?: string) => {
    if (!url) return false;
    return (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh")
    );
};

// 2. Request Interceptor (runs before every request)
api.interceptors.request.use((config) => {
    // Only force JSON if the payload is NOT a FormData object
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }
    // ... (your auth token logic)
    return config;
});

// 3. Response Interceptor (runs after every response)
api.interceptors.response.use(
    (response) => response, // If successful, pass data through

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Failed login/register must not trigger a silent refresh redirect loop
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthCredentialRequest(originalRequest.url)
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post<
                    IApiResponse<{ accessToken: string }>
                >(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data.data.accessToken;
                Cookies.set("accessToken", newAccessToken, {
                    expires: 1,
                    sameSite: "lax",
                    secure:
                        typeof window !== "undefined" &&
                        window.location.protocol === "https:",
                });

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                Cookies.remove("accessToken");
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
