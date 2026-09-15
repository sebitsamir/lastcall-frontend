"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { IAuction } from "@/types";
import type { AuctionFilters as ApiAuctionFilters } from "@/services/auctionService";

import { auctionService } from "@/services/auctionService";

import { AuctionFilters } from "@/components/auction/AuctionFilters";
import { AuctionGrid } from "@/components/auction/AuctionGrid";
import { PageTransition } from "@/components/layout/PageTransition";

import { useDebounce } from "@/hooks/useDebounce";
import { usePageTitle } from "@/hooks/usePageTitle";

type SortOption =
    | "endingSoon"
    | "priceLow"
    | "priceHigh"
    | "newest";

interface FilterValues {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    sortBy: SortOption;
}

function isSortOption(value: string | null): value is SortOption {
    return (
        value === "endingSoon" ||
        value === "priceLow" ||
        value === "priceHigh" ||
        value === "newest"
    );
}

export default function AuctionsPage() {
    return (
        <Suspense fallback={<AuctionsPageSkeleton />}>
            <AuctionsPageContent />
        </Suspense>
    );
}

function AuctionsPageSkeleton() {
    return (
        <PageTransition>
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
                <div className="min-h-[60vh]" />
            </div>
        </PageTransition>
    );
}

function AuctionsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    usePageTitle("Auctions — LastCall");

    /*
     * URL is the source of truth.
     *
     * This removes the old:
     * URL -> state effect
     * state -> URL effect
     *
     * which could fight each other.
     */
    const search = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "all";
    const minPrice = searchParams.get("minPrice") ?? "";
    const maxPrice = searchParams.get("maxPrice") ?? "";

    const sortParam = searchParams.get("sortBy");

    const sortBy: SortOption = isSortOption(sortParam)
        ? sortParam
        : "newest";

    const filters: FilterValues = {
        search,
        category,
        minPrice,
        maxPrice,
        sortBy,
    };

    /*
     * We only debounce the API search.
     *
     * The URL/input can update immediately,
     * while the backend request waits briefly.
     */
    const debouncedSearch = useDebounce(search, 500);

    const [auctions, setAuctions] = useState<IAuction[] | null>(
        null
    );

    /*
     * Fetch auctions.
     *
     * Notice:
     * - no synchronous setIsLoading(true)
     * - no URL mutation here
     * - no filter-state mutation here
     */
    useEffect(() => {
        let cancelled = false;

        async function loadAuctions() {
            const parsedMinPrice =
                minPrice.trim() !== ""
                    ? Number(minPrice)
                    : undefined;

            const parsedMaxPrice =
                maxPrice.trim() !== ""
                    ? Number(maxPrice)
                    : undefined;

            const apiFilters: ApiAuctionFilters = {
                search:
                    debouncedSearch.trim() !== ""
                        ? debouncedSearch.trim()
                        : undefined,

                category:
                    category !== "all"
                        ? category
                        : undefined,

                sortBy,

                minPrice:
                    parsedMinPrice !== undefined &&
                    Number.isFinite(parsedMinPrice)
                        ? parsedMinPrice
                        : undefined,

                maxPrice:
                    parsedMaxPrice !== undefined &&
                    Number.isFinite(parsedMaxPrice)
                        ? parsedMaxPrice
                        : undefined,
            };

            try {
                const data =
                    await auctionService.getActiveAuctions(
                        apiFilters
                    );

                if (!cancelled) {
                    setAuctions(data);
                }
            } catch (error) {
                console.error(
                    "Failed to load auctions:",
                    error
                );

                if (!cancelled) {
                    setAuctions([]);
                }
            }
        }

        void loadAuctions();

        return () => {
            cancelled = true;
        };
    }, [
        debouncedSearch,
        category,
        minPrice,
        maxPrice,
        sortBy,
    ]);

    /*
     * Changes a single URL filter.
     *
     * There is no local filter state anymore.
     */
    const handleFilterChange = (
        key: string,
        value: string
    ) => {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        const normalizedValue = value.trim();

        switch (key) {
            case "search": {
                if (normalizedValue) {
                    params.set("q", value);
                } else {
                    params.delete("q");
                }

                break;
            }

            case "category": {
                if (
                    normalizedValue &&
                    normalizedValue !== "all"
                ) {
                    params.set(
                        "category",
                        normalizedValue
                    );
                } else {
                    params.delete("category");
                }

                break;
            }

            case "minPrice": {
                if (normalizedValue) {
                    params.set(
                        "minPrice",
                        normalizedValue
                    );
                } else {
                    params.delete("minPrice");
                }

                break;
            }

            case "maxPrice": {
                if (normalizedValue) {
                    params.set(
                        "maxPrice",
                        normalizedValue
                    );
                } else {
                    params.delete("maxPrice");
                }

                break;
            }

            case "sortBy": {
                if (
                    isSortOption(normalizedValue) &&
                    normalizedValue !== "newest"
                ) {
                    params.set(
                        "sortBy",
                        normalizedValue
                    );
                } else {
                    params.delete("sortBy");
                }

                break;
            }

            default: {
                return;
            }
        }

        const queryString = params.toString();

        router.replace(
            queryString
                ? `/auctions?${queryString}`
                : "/auctions",
            {
                scroll: false,
            }
        );
    };

    const clearFilters = () => {
        router.replace("/auctions", {
            scroll: false,
        });
    };

    return (
        <PageTransition>
            <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-8">
                <div className="space-y-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                        Live Marketplace
                    </p>

                    <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                        Curated Auctions
                    </h1>

                    <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                        Discover exceptional pieces and place
                        your bid in real-time. Every item is
                        verified and authenticated.
                    </p>
                </div>

                <div className="grid gap-10 lg:grid-cols-4">
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 rounded-sm border border-border bg-card">
                            <div className="p-6">
                                <AuctionFilters
                                    filters={filters}
                                    onFilterChange={
                                        handleFilterChange
                                    }
                                    onClear={clearFilters}
                                />
                            </div>
                        </div>
                    </aside>

                    <main className="lg:col-span-3">
                        <AuctionGrid
                            auctions={auctions ?? []}
                            loading={auctions === null}
                            skeletonCount={6}
                            onClearFilters={
                                clearFilters
                            }
                        />
                    </main>
                </div>
            </div>
        </PageTransition>
    );
}