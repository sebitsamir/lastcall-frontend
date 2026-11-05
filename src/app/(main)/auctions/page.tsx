"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { IAuction } from "@/types";
import type { AuctionFilters as ApiAuctionFilters } from "@/services/auctionService";

import { auctionService } from "@/services/auctionService";

import { SlidersHorizontal } from "lucide-react";

import { AUCTION_CATEGORIES } from "@/lib/api/auctions";
import { cn } from "@/lib/utils";

import { AuctionFilters } from "@/components/auction/AuctionFilters";
import { AuctionGrid } from "@/components/auction/AuctionGrid";
import { FilterSheet } from "@/components/auction/FilterSheet";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/select";

import { useDebounce } from "@/hooks/useDebounce";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNow } from "@/hooks/useNow";

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
            <div className="mx-auto max-w-[1200px] px-[clamp(16px,3vw,32px)] py-7">
                <div className="min-h-[60vh]" />
            </div>
        </PageTransition>
    );
}

function AuctionsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    usePageTitle("Auctions — LastCall");
    const now = useNow(1_000);

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

    // Small screens open the filter panel as a bottom sheet.
    const [sheetOpen, setSheetOpen] = useState(false);

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
                status: "floor",
                limit: 24,

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

    const activeFilterCount =
        (category !== "all" ? 1 : 0) +
        (minPrice.trim() !== "" ? 1 : 0) +
        (maxPrice.trim() !== "" ? 1 : 0) +
        (search.trim() !== "" ? 1 : 0);

    const count = auctions?.length ?? 0;

    const filterPanel = (
        <AuctionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={clearFilters}
        />
    );

    return (
        <PageTransition>
            <div className="mx-auto max-w-[1200px] px-[clamp(16px,3vw,32px)] pt-7">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[clamp(26px,3.4vw,38px)] tracking-[-0.02em]">
                            {category === "all" ? "All auctions" : category}
                        </h1>
                        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base" aria-live="polite">
                            {auctions === null
                                ? "Loading the floor…"
                                : `${count} ${count === 1 ? "lot" : "lots"} on the floor`}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            variant="secondary"
                            className="min-[900px]:hidden"
                            onClick={() => setSheetOpen(true)}
                        >
                            <SlidersHorizontal className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                        </Button>

                        <NativeSelect
                            aria-label="Sort"
                            value={sortBy}
                            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                            wrapperClassName="min-w-[170px]"
                            className="h-11 rounded-full"
                        >
                            <option value="newest">Newest first</option>
                            <option value="endingSoon">Ending soonest</option>
                            <option value="priceLow">Price: low to high</option>
                            <option value="priceHigh">Price: high to low</option>
                        </NativeSelect>
                    </div>
                </div>

                {/* Category pills: one tap, same URL contract as the filter select */}
                <div
                    role="group"
                    aria-label="Category"
                    className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {["all", ...AUCTION_CATEGORIES].map((c) => (
                        <button
                            key={c}
                            type="button"
                            aria-pressed={category === c}
                            onClick={() => handleFilterChange("category", c)}
                            className={cn(
                                "h-[38px] whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors",
                                category === c
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                            )}
                        >
                            {c === "all" ? "All" : c}
                        </button>
                    ))}
                </div>

                <div className="grid items-start gap-8 min-[900px]:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="sticky top-[140px] hidden min-[900px]:block lg:top-24">
                        {filterPanel}
                    </aside>

                    <div>
                        <AuctionGrid
                            auctions={auctions ?? []}
                            loading={auctions === null}
                            skeletonCount={6}
                            onClearFilters={clearFilters}
                            now={now}
                        />
                    </div>
                </div>
            </div>

            <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
                {filterPanel}
            </FilterSheet>
        </PageTransition>
    );
}