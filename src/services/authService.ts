// src/services/authService.ts
import Cookies from "js-cookie";
import api from "@/lib/api";
import { IApiResponse, IUser } from "@/types";

type AuthPayload = {
    accessToken: string;
    user: IUser & { id?: string };
};

const normalizeUser = (user: IUser & { id?: string }): IUser => ({
    ...user,
    _id: user._id || user.id || "",
});

const persistAccessToken = (accessToken: string) => {
    Cookies.set("accessToken", accessToken, {
        expires: 1,
        sameSite: "lax",
        secure: typeof window !== "undefined" && window.location.protocol === "https:",
    });
};

export const authService = {
    register: async (userData: { name: string; email: string; password: string }) => {
        const response = await api.post<IApiResponse<AuthPayload>>(
            "/auth/register",
            userData
        );
        const data = response.data.data;
        persistAccessToken(data.accessToken);
        return { ...data, user: normalizeUser(data.user) };
    },

    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post<IApiResponse<AuthPayload>>(
            "/auth/login",
            credentials
        );
        const data = response.data.data;
        persistAccessToken(data.accessToken);
        return { ...data, user: normalizeUser(data.user) };
    },
};
