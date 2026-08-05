// src/services/authService.ts
import api from "@/lib/api";
import { IApiResponse, IUser } from "@/types";

export const authService = {
    register: async (userData: { name: string; email: string; password: string }) => {
        
        const response = await api.post<IApiResponse<{ user: IUser; token: string }>>(
            "/auth/register",
            userData
        );
        return response.data.data;
    },

    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post<IApiResponse<{ user: IUser; token: string }>>(
            "/auth/login",
            credentials
        );
        return response.data.data;
    },
};