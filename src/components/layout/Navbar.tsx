// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";

export function Navbar() {
    const { user, logout } = useAuthStore();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                    LastCall
                </Link>

                {/* Right Side: User Info & Logout */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-medium text-slate-900">{user?.name}</span>
                        <span className="text-xs text-slate-500">
                            Balance: <span className="font-semibold text-success-dark">${user?.availableBalance.toFixed(2)}</span>
                        </span>
                    </div>

                    <Link href="/profile">
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </Link>

                    <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                        <LogOut className="h-5 w-5 text-slate-600" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}