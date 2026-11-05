"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Search } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

interface NavItem {
    href: string;
    label: string;
    /** Only shown to signed-in users. */
    authOnly?: boolean;
}

const NAV: NavItem[] = [
    { href: "/auctions", label: "Auctions" },
    { href: "/categories", label: "Categories" },
    { href: "/auctions/create", label: "Sell", authOnly: true },
    { href: "/watchlist", label: "Watchlist" },
];

/** "/auctions" must not light up for "/auctions/create" (Sell owns that route). */
function isActive(pathname: string, href: string): boolean {
    if (href === "/auctions") {
        return (
            pathname === "/auctions" ||
            (pathname.startsWith("/auctions/") && !pathname.startsWith("/auctions/create"))
        );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name?: string): string {
    const letters = (name ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();

    return letters || "ME";
}

export function TopHeader() {
    const router = useRouter();
    const pathname = usePathname();

    const { user, isAuthenticated } = useAuthStore();

    const [query, setQuery] = useState("");
    const [touched, setTouched] = useState(false);

    /*
     * Pre-fill from the URL only when the user focuses the field on the
     * auctions page. This avoids useSearchParams() in the global shell and
     * any server/client markup mismatch.
     */
    const handleFocus = () => {
        if (touched) return;
        if (pathname === "/auctions") {
            const params = new URLSearchParams(window.location.search);
            setQuery(params.get("q") ?? "");
        }
        setTouched(true);
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedQuery = query.trim().replace(/\s+/g, " ").slice(0, 80);

        if (!normalizedQuery) {
            router.push("/auctions");
            return;
        }

        const params = new URLSearchParams();
        params.set("q", normalizedQuery);

        router.push(`/auctions?${params.toString()}`);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
            <div
                className={cn(
                    "mx-auto grid w-full max-w-[1200px] items-center gap-x-4 gap-y-1.5 px-[clamp(16px,3vw,32px)] pb-3 pt-2.5",
                    "grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto]",
                    "lg:h-[72px] lg:grid-cols-[auto_minmax(220px,460px)_1fr_auto] lg:gap-6 lg:py-0"
                )}
            >
                <Wordmark className="col-start-1 row-start-1" />

                <form
                    role="search"
                    onSubmit={handleSearch}
                    className={cn(
                        "col-span-2 row-start-2 md:col-span-3",
                        "lg:col-span-1 lg:col-start-2 lg:row-start-1",
                        "flex h-11 items-center gap-2.5 rounded-full border border-border bg-card px-4 text-muted-foreground transition-[border-color,box-shadow]",
                        "focus-within:border-primary-text focus-within:text-foreground focus-within:ring-4 focus-within:ring-primary/12"
                    )}
                >
                    <Search className="h-5 w-5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                    <input
                        type="search"
                        name="q"
                        value={query}
                        maxLength={80}
                        autoComplete="off"
                        spellCheck={false}
                        enterKeyHint="search"
                        placeholder="Search auctions and items"
                        aria-label="Search auctions"
                        onFocus={handleFocus}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setTouched(true);
                        }}
                        className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-[15px]"
                    />
                </form>

                <nav
                    aria-label="Primary"
                    className="hidden justify-end gap-1 md:col-start-2 md:row-start-1 md:flex lg:col-start-3"
                >
                    {NAV.filter((item) => !item.authOnly || isAuthenticated).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive(pathname, item.href) ? "page" : undefined}
                            className={cn(
                                "flex h-11 items-center rounded-full px-4 text-sm font-medium transition-colors lg:h-10",
                                isActive(pathname, item.href)
                                    ? "bg-secondary text-foreground"
                                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="col-start-2 row-start-1 flex items-center gap-1 md:col-start-3 lg:col-start-4">
                    <ThemeToggle />
                    {isAuthenticated && <NotificationBell />}

                    {isAuthenticated ? (
                        <Link
                            href="/account"
                            aria-label="Account"
                            className="ml-1 grid h-10 w-10 place-items-center rounded-full border border-border bg-primary/12 text-[13px] font-bold text-primary-text sm:ml-1.5"
                        >
                            {initials(user?.name)}
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="ml-1 flex h-10 items-center rounded-full border border-border-strong px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:ml-1.5 sm:px-4"
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
