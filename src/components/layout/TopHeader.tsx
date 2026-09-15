"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Heart, Search, User, X } from "lucide-react";

import { useAuthStore } from "@/store/authStore";

export function TopHeader() {
    const router = useRouter();
    const pathname = usePathname();

    const { isAuthenticated } = useAuthStore();

    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    const closeSearch = () => {
        setSearchOpen(false);
    };

    const openSearch = () => {
        /*
         * Read the existing ?q= value only when the user opens search.
         * This avoids useSearchParams() in the global application shell.
         */
        if (typeof window !== "undefined" && pathname === "/auctions") {
            const params = new URLSearchParams(window.location.search);
            setQuery(params.get("q") ?? "");
        } else {
            setQuery("");
        }

        setSearchOpen(true);

        /*
         * Focus after React renders the search panel.
         */
        window.requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    const toggleSearch = () => {
        if (searchOpen) {
            closeSearch();
        } else {
            openSearch();
        }
    };

    /*
     * Escape-key handling does not synchronously set state as part
     * of effect initialization, so it is safe with modern hooks linting.
     */
    useEffect(() => {
        if (!searchOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeSearch();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [searchOpen]);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedQuery = query
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 80);

        closeSearch();

        if (!normalizedQuery) {
            router.push("/auctions");
            return;
        }

        const params = new URLSearchParams();
        params.set("q", normalizedQuery);

        router.push(`/auctions?${params.toString()}`);
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-8">
                <Link
                    href="/"
                    onClick={closeSearch}
                    className="font-serif text-2xl tracking-tight text-foreground"
                >
                    LAST
                    <span className="text-primary">
                        CALL
                    </span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    <Link
                        href="/auctions"
                        onClick={closeSearch}
                        className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Auctions
                    </Link>

                    <Link
                        href="/categories"
                        onClick={closeSearch}
                        className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Categories
                    </Link>

                    {isAuthenticated && (
                        <Link
                            href="/auctions/create"
                            onClick={closeSearch}
                            className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Sell
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        aria-label={
                            searchOpen
                                ? "Close auction search"
                                : "Search auctions"
                        }
                        aria-expanded={searchOpen}
                        aria-controls="global-auction-search"
                        onClick={toggleSearch}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {searchOpen ? (
                            <X
                                className="h-4 w-4"
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />
                        ) : (
                            <Search
                                className="h-4 w-4"
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />
                        )}
                    </button>

                    <Link
                        href="/watchlist"
                        onClick={closeSearch}
                        aria-label="Watchlist"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Heart
                            className="h-4 w-4"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    </Link>

                    {isAuthenticated ? (
                        <Link
                            href="/account"
                            onClick={closeSearch}
                            aria-label="Account"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <User
                                className="h-4 w-4"
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            onClick={closeSearch}
                            className="border border-border px-4 py-1.5 text-[10px] uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </header>

            {searchOpen && (
                <div
                    id="global-auction-search"
                    className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background/95 px-4 py-4 shadow-lg shadow-black/10 backdrop-blur-xl md:px-8"
                >
                    <form
                        onSubmit={handleSearch}
                        role="search"
                        className="mx-auto flex max-w-3xl items-center gap-3"
                    >
                        <Search
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                        <input
                            ref={inputRef}
                            type="search"
                            name="q"
                            value={query}
                            maxLength={80}
                            autoComplete="off"
                            spellCheck={false}
                            enterKeyHint="search"
                            placeholder="Search auctions by title or description..."
                            aria-label="Search auctions"
                            onChange={(event) => {
                                setQuery(event.target.value);
                            }}
                            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        />

                        {query.length > 0 && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() => {
                                    setQuery("");
                                    inputRef.current?.focus();
                                }}
                                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X
                                    className="h-4 w-4"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </button>
                        )}

                        <button
                            type="submit"
                            className="border border-primary bg-primary px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            Search
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}