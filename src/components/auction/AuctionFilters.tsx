"use client";

import { Search } from "lucide-react";
import { AUCTION_CATEGORIES } from "@/lib/api/auctions";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";

interface AuctionFiltersProps {
    filters: {
        search: string;
        category: string;
        minPrice: string;
        maxPrice: string;
        sortBy: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClear: () => void;
}

/** Small-caps group label used by every filter group (design `.fl`). */
const GROUP_LABEL = "mb-2.5 block text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground";

export function AuctionFilters({ filters, onFilterChange, onClear }: AuctionFiltersProps) {
    return (
        <div className="grid gap-[22px] rounded-panel border border-border bg-card p-[22px]">
            <div className="flex items-center justify-between">
                <h3 className="text-lg">Filters</h3>
                <button
                    type="button"
                    onClick={onClear}
                    className="text-[13px] font-semibold text-primary-text"
                >
                    Reset
                </button>
            </div>

            {/* Search */}
            <div>
                <label className={GROUP_LABEL} htmlFor="filter-search">Search</label>
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        strokeWidth={1.7}
                        aria-hidden="true"
                    />
                    <Input
                        id="filter-search"
                        placeholder="Watches, Art, Cameras..."
                        className="pl-11"
                        value={filters.search}
                        onChange={(e) => onFilterChange("search", e.target.value)}
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <label className={GROUP_LABEL} htmlFor="filter-category">Category</label>
                <NativeSelect
                    id="filter-category"
                    value={filters.category}
                    onChange={(e) => onFilterChange("category", e.target.value)}
                >
                    <option value="all">All categories</option>
                    {AUCTION_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </NativeSelect>
            </div>

            {/* Price Range */}
            <div>
                <span className={GROUP_LABEL}>Price range ($)</span>
                <div className="grid grid-cols-2 gap-2.5">
                    <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="Min"
                        aria-label="Minimum price"
                        value={filters.minPrice}
                        onChange={(e) => onFilterChange("minPrice", e.target.value)}
                    />
                    <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="Max"
                        aria-label="Maximum price"
                        value={filters.maxPrice}
                        onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
