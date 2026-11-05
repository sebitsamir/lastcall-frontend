"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Gavel, Heart, Plus, User } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();

    const links = [
        { href: "/", label: "Home", icon: Compass },
        { href: "/auctions", label: "Auctions", icon: Gavel },
        // The center action is rendered separately below.
        { href: "/watchlist", label: "Watchlist", icon: Heart },
        { href: isAuthenticated ? "/account" : "/login", label: "Account", icon: User },
    ];

    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

    const renderLink = (link: (typeof links)[number]) => {
        const active = isActive(link.href);
        return (
            <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                    "relative flex min-h-12 flex-1 flex-col items-center justify-center gap-[3px] text-[11px] font-medium transition-colors",
                    active ? "text-primary-text" : "text-muted-foreground"
                )}
            >
                <link.icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                {link.label}
            </Link>
        );
    };

    return (
        <nav
            aria-label="Mobile"
            className="fixed inset-x-0 bottom-0 z-[55] flex items-center justify-around border-t border-border bg-card px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))] md:hidden"
        >
            {renderLink(links[0])}
            {renderLink(links[1])}

            <Link
                href={isAuthenticated ? "/auctions/create" : "/login"}
                aria-label="Sell an item"
                className="-mt-[22px] flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground transition-transform active:scale-95"
            >
                <Plus className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </Link>

            {renderLink(links[2])}
            {renderLink(links[3])}
        </nav>
    );
}
