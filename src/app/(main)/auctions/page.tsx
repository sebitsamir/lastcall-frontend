"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react"; 

import { IAuction } from "@/types";
import { auctionService } from "@/services/auctionService"; 
import { AuctionFilters } from "@/components/auction/AuctionFilters";
import { AuctionGrid } from "@/components/auction/AuctionGrid"; 
import { useDebounce } from "@/hooks/useDebounce";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PageTransition } from "@/components/layout/PageTransition";

export default function AuctionsPage() {
    // Next.js requires useSearchParams to be wrapped in Suspense
    return (
        <Suspense fallback={<PageTransition><div className="h-screen" /></PageTransition>}>
            <AuctionsPageContent />
        </Suspense>
    );
}

function AuctionsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Hydrate from URL so shared links work (Phase 2/6 polish)
    const [filters, setFilters] = useState({
        search: searchParams.get("q") || "",
        category: searchParams.get("category") || "all",
        minPrice: "",
        maxPrice: "",
        sortBy: (searchParams.get("sortBy") as any) || "newest",
    });

    const [auctions, setAuctions] = useState<IAuction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const debouncedSearch = useDebounce(filters.search, 500);

    usePageTitle("Auctions — LastCall");

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                const apiFilters = {
                    category: filters.category !== "all" ? filters.category : undefined,
                    sortBy: filters.sortBy,
                    search: debouncedSearch || undefined,
                    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                };
                const data = await auctionService.getActiveAuctions(apiFilters);
                setAuctions(Array.isArray(data) ? data : []);
            } catch (error) {
                setAuctions([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAuctions();
    }, [debouncedSearch, filters.category, filters.sortBy, filters.minPrice, filters.maxPrice]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.category !== "all") params.set("category", filters.category);
        if (debouncedSearch) params.set("q", debouncedSearch);
        if (filters.sortBy !== "newest") params.set("sortBy", filters.sortBy);

        router.replace(`/auctions${params.toString() ? `?${params}` : ""}`, { scroll: false });
    }, [filters.category, debouncedSearch, filters.sortBy, router]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: "", category: "all", minPrice: "", maxPrice: "", sortBy: "newest" });
    };

    return (
        // PageTransition wraps the entire page for smooth route changes
        <PageTransition>
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 space-y-10">
                {/* Header - Clean, editorial, no fluff */}
                <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-medium">
                        Live Marketplace
                    </p>
                    <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground leading-tight">
                        Curated Auctions
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                        Discover exceptional pieces and place your bid in real-time.
                        Every item is verified and authenticated.
                    </p>
                </div>

                <div className="grid gap-10 lg:grid-cols-4">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="border border-border bg-card sticky top-24 rounded-sm">
                            <div className="p-6">
                                <AuctionFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onClear={clearFilters}
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid - Replaced manual loading/empty states with premium AuctionGrid */}
                    <main className="lg:col-span-3">
                        <AuctionGrid
                            auctions={auctions}
                            loading={isLoading}
                            skeletonCount={6}
                            onClearFilters={clearFilters}
                        />
                    </main>
                </div>
            </div>
        </PageTransition>
    );
}