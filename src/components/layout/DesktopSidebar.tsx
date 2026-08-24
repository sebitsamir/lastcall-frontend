"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Gavel, Package, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const links = [
    { href: "/account", label: "Dashboard", icon: LayoutDashboard },
    { href: "/account/wallet", label: "Wallet", icon: Wallet },
    { href: "/account/bids", label: "Active Bids", icon: Gavel },
    { href: "/account/selling", label: "Selling", icon: Package },
    { href: "/account/settings", label: "Settings", icon: Settings },
];

export function DesktopSidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((s) => s.logout);

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-border bg-background md:flex">
            <nav className="flex-1 space-y-1 px-4 py-8">
                <p className="mb-4 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Account
                </p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors ${isActive
                                    ? "border-primary bg-white/5 text-foreground"
                                    : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                }`}
                        >
                            <link.icon className="h-4 w-4" strokeWidth={1.5} />
                            <span className="tracking-wide">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-border p-4">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
                >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    <span className="tracking-wide">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}