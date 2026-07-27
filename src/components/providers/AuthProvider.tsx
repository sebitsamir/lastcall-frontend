"use client"; // This must be a client component because it uses hooks and Zustand

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children } : { children: React.ReactNode}) {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        // Run this code once when the app mounts
        initializeAuth();
    }, [initializeAuth]);

    return <>{children}</>;
}