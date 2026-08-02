"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // ONLY redirect if we are DONE loading AND the user is NOT authenticated
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // 1. Show a loading spinner while checking auth status
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
            </div>
        );
    }

    // 2. If done loading and still not authenticated, render nothing (redirect is happening)
    if (!isAuthenticated) {
        return null;
    }

    // 3. Otherwise, render the protected page
    return <>{children}</>;
}