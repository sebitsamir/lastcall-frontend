import api from "@/lib/api";
import { IApiResponse, IUser, LoginValues, RegisterValues } from "@/types";
import { register } from "module";

export const authService = {
    // Login
    login: async (data: LoginValues) => {
        const response = await api.post<IApiResponse<{ accessToken: string, User: IUser }>>(
            "/auth/login",
            data
        );
        return response.data.data;
    },

    // Register
    register: async (data: RegisterValues) => {
        const response = await api.post<IApiResponse<{ accessToken: string, user: IUser }>>(
            "/auth/register",
            data
        );
        return response.data.data;
    },
};