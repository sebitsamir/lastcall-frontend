"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export function AuctionFilters({ filters, onFilterChange, onClear }: AuctionFiltersProps) {
    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
                    Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-text-secondary hover:text-text-primary">
                    Clear All
                </Button>
            </div>

            {/* Search */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50" />
                    <Input
                        placeholder="Watches, Art, Cars..."
                        className="pl-9 bg-background-card/50"
                        value={filters.search}
                        onChange={(e) => onFilterChange("search", e.target.value)}
                    />
                </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Category</label>
                <select
                    className="flex h-11 w-full rounded-lg border border-white/10 bg-background-card/50 px-4 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                    value={filters.category}
                    onChange={(e) => onFilterChange("category", e.target.value)}
                >
                    <option value="all">All Categories</option>
                    <option value="watches">Luxury Watches</option>
                    <option value="art">Fine Art</option>
                    <option value="cars">Classic Cars</option>
                    <option value="electronics">Electronics</option>
                </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Price Range</label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        className="bg-background-card/50"
                        value={filters.minPrice}
                        onChange={(e) => onFilterChange("minPrice", e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        className="bg-background-card/50"
                        value={filters.maxPrice}
                        onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                    />
                </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Sort By</label>
                <select
                    className="flex h-11 w-full rounded-lg border border-white/10 bg-background-card/50 px-4 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange("sortBy", e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="endingSoon">Ending Soon</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
}