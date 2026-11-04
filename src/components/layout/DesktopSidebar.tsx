// src/components/layout/DesktopSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Wallet, Gavel, Package, Settings, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";

export const ACCOUNT_LINKS = [
    { href: "/account", label: "Dashboard", icon: LayoutDashboard },
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/wallet", label: "Wallet", icon: Wallet },
    { href: "/account/bids", label: "Active Bids", icon: Gavel },
    { href: "/account/selling", label: "Selling", icon: Package },
    { href: "/account/settings", label: "Settings", icon: Settings },
];

export function DesktopSidebar() {
    const pathname = usePathname();
    const handleLogout = useLogout(); // Secure logout (kills socket + cookies + store)

    return (
        <aside className="sticky top-28 hidden w-60 shrink-0 self-start py-10 pl-[clamp(16px,3vw,32px)] pr-4 md:block lg:top-24">
            <nav aria-label="Account" className="space-y-1">
                <p className="mb-3 px-4 text-xs font-semibold text-muted-foreground">Account</p>

                {ACCOUNT_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-secondary text-foreground"
                                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                            )}
                        >
                            <link.icon className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-6 border-t border-border pt-4">
                <button
                    onClick={handleLogout}
                    className="flex h-11 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
