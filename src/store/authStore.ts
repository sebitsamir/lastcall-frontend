import { create } from "zustand";
import Cookies from "js-cookie";
import { IUser } from "@/types";
import api from "@/lib/api";

// 1. Define the shape of our state and the actions we can perform
interface AuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setAuth: (user: IUser) => void;
    logout: () => void;
    initializeAuth: () => Promise<void>;
}

// 2. Creating the store
export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial State
    user: null,
    isAuthenticated: false,
    isLoading: true,

    // Action: Called when a user successfully logs in or register
    setAuth: (user) => set({
        user,
        isAuthenticated: true,
        isLoading: false
    }),

    // Action: Called when the user clicks "Logout"
    logout: () => {
        Cookies.remove("accessToken");
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
        window.location.href = "/login";
    },

    // Action: Called when the app first loads to check if the user is already logged in
    initializeAuth: async () => {
        const token = Cookies.get("accessToken");

        // If no token exists in the cookie, they aren't logged in
        if(!token) {
            set({ isLoading: false });
            return;
        }

        try {
            // If a token exists, ask the backend who this user is
            const response = await api.get("/users/me");

            set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false
            });
        }
        catch (error) {
            // If the token is invalid/expired, clear it and mark as not authenticated
            Cookies.remove("accessToken");
            set({ isLoading: false });
        }
    }
}));

