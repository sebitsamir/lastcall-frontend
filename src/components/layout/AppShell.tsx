"use client";

import { usePathname } from "next/navigation";
import { TopHeader } from "./TopHeader";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Footer } from "./Footer";
import { useAuthStore } from "@/store/authStore";
import { NotificationManager } from "@/components/notifications/NotificationManager";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();

    // Keep auth pages immersive — no shell chrome
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

    // The account rail only belongs to the account area.
    const showSidebar = isAuthenticated && pathname.startsWith("/account");

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <TopHeader />

            {showSidebar ? (
                <div className="mx-auto flex w-full max-w-[1200px] flex-1">
                    <DesktopSidebar />
                    <main id="main-content" className="w-full min-w-0 flex-1 pb-24 md:pb-0">
                        {children}
                    </main>
                </div>
            ) : (
                <main id="main-content" className="w-full min-w-0 flex-1 pb-24 md:pb-0">
                    {children}
                </main>
            )}

            {isAuthenticated && <NotificationManager />}

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
