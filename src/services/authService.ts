import api from "@/lib/api";
import { IApiResponse, IUser, ILoginPayload, IRegisterPayload } from "@/types";

export const authService = {
    // Login
    login: async (data: ILoginPayload) => {
        const response = await api.post<IApiResponse<{ accessToken: string, User: IUser }>>(
            "/auth/login",
            data
        );
        return response.data.data;
    },

    // Register
    register: async (data: IRegisterPayload) => {
        const response = await api.post<IApiResponse<{ accessToken: string, user: IUser }>>(
            "/auth/register",
            data
        );
        return response.data.data;
    },
};