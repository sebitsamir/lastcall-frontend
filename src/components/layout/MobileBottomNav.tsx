"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Gavel, Heart, Wallet, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function MobileBottomNav() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();

    const links = [
        { href: "/", label: "Discover", icon: Compass },
        { href: "/auctions", label: "Auctions", icon: Gavel },
        { href: "/watchlist", label: "Watchlist", icon: Heart },
        { href: isAuthenticated ? "/account/wallet" : "/login", label: "Wallet", icon: Wallet },
        { href: isAuthenticated ? "/account" : "/login", label: "Me", icon: User },
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        <link.icon className="h-5 w-5" strokeWidth={1.5} />
                        <span className="text-[10px] font-medium uppercase tracking-wider">{link.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}