"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut } from "lucide-react";
import { Wordmark } from "./Wordmark";

export function Navbar() {
    const { user, logout } = useAuthStore();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            {/* Subtle top accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 lg:px-8">
                {/* Logo */}
                <Wordmark />

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            {/* User Info - Elegant */}
                            <div className="hidden flex-col items-end border-r border-border pr-4 md:flex">
                                <span className="text-sm font-medium text-foreground">{user.name}</span>
                                <span className="text-xs text-gold font-medium">
                                    ${user.availableBalance.toLocaleString()}
                                </span>
                            </div>

                            <Link href="/watchlist">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-gold hover:bg-gold/5">
                                    <Heart className="h-4 w-4" />
                                </Button>
                            </Link>

                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-secondary">
                                    <User className="h-4 w-4" />
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}