"use client";

import { usePathname } from "next/navigation";
import { TopHeader } from "./TopHeader";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuthStore } from "@/store/authStore";
import { PageTransition } from "./PageTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuthStore();

    // Keep auth pages immersive — no shell chrome
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-5 w-5 animate-spin rounded-full border border-primary border-t-transparent" />
            </div>
        );
    }

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <TopHeader />

            <div className="flex flex-1">
                {isAuthenticated && <DesktopSidebar />}
                <main id="main-content" className="flex-1 w-full min-w-0 pb-16 md:pb-0">
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>

            <MobileBottomNav />
        </div>
    );
}