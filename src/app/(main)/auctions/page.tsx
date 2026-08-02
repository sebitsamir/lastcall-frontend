"use client";

import { useEffect, useState } from "react";
import { IAuction } from "@/types";
import { auctionService } from "@/services/auctionService";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { AuctionFilters } from "@/components/auction/AuctionFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<IAuction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: "",
        category: "all",
        minPrice: "",
        maxPrice: "",
        sortBy: "newest",
    });

    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                const apiFilters = {
                    category: filters.category !== "all" ? filters.category : undefined,
                    sortBy: filters.sortBy as any,
                    search: debouncedFilters.search || undefined,
                    minPrice: debouncedFilters.minPrice ? Number(debouncedFilters.minPrice) : undefined,
                    maxPrice: debouncedFilters.maxPrice ? Number(debouncedFilters.maxPrice) : undefined,
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
    }, [debouncedFilters, filters.category, filters.sortBy]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: "", category: "all", minPrice: "", maxPrice: "", sortBy: "newest" });
    };

    return (
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 space-y-10">
            {/* Header - Clean, editorial, no fluff */}
            <div className="animate-fade-up space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
                    Live Marketplace
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
                    Curated Auctions
                </h1>
                <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                    Discover exceptional pieces and place your bid in real-time. 
                    Every item is verified and authenticated.
                </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-4">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1 animate-fade-up-delay-1">
                    <Card className="border-border bg-card sticky top-24">
                        <CardContent className="p-6">
                            <AuctionFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClear={clearFilters}
                            />
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Grid */}
                <main className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-96">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-gold" />
                                <p className="text-sm text-muted-foreground">Loading auctions...</p>
                            </div>
                        </div>
                    ) : auctions.length === 0 ? (
                        <Card className="border-border bg-card">
                            <CardContent className="p-16 text-center space-y-3">
                                <p className="font-display text-2xl text-foreground">No auctions found</p>
                                <p className="text-muted-foreground text-sm">Try adjusting your filters to see more results.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {auctions.map((auction, index) => (
                                <AuctionCard key={auction._id} auction={auction} index={index} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}