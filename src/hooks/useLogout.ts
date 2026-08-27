// src/hooks/useLogout.ts
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

import { useAuthStore } from "@/store/authStore";
import { disconnectSocket } from "@/lib/socket";

/**
 * Single source of truth for sign-out.
 * Order matters: kill the socket, then the tokens, then the store.
 */
export function useLogout() {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);

    return () => {
        disconnectSocket();
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        logout();
        toast.success("Signed out successfully.");
        router.push("/login");
    };
}