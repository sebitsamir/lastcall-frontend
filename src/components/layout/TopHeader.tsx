"use client";

import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; // adjust path if needed (e.g. @/stores/authStore)

export function TopHeader() {
    const { isAuthenticated } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-4 md:px-8">
            {/* Editorial Wordmark */}
            <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                LAST<span className="text-primary">CALL</span>
            </Link>

            {/* Desktop Center Nav */}
            <nav className="hidden md:flex items-center gap-8">
                <Link href="/auctions" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    Auctions
                </Link>
                <Link href="/categories" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    Categories
                </Link>
                {isAuthenticated && (
                    <Link href="/auctions/create" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                        Sell
                    </Link>
                )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
                <button aria-label="Search" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Search className="h-4 w-4" strokeWidth={1.5} />
                </button>

                <Link href="/watchlist" aria-label="Watchlist" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Heart className="h-4 w-4" strokeWidth={1.5} />
                </Link>

                {isAuthenticated ? (
                    <Link href="/account" aria-label="Account" className="text-muted-foreground hover:text-foreground transition-colors">
                        <User className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="border border-border px-4 py-1.5 text-[10px] uppercase tracking-widest text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
}