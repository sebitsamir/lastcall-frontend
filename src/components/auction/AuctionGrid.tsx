/**
 * Owns the three visual states of any collection:
 *   loading → geometry-matched skeletons
 *   empty   → designed EmptyState with a recovery action
 *   data    → the lot grid
 * Pages stay thin; they just hand over data + flags.
 */
import { Gavel } from "lucide-react";
import type { IAuction } from "@/types";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { AuctionCardSkeleton } from "@/components/auction/AuctionCardSkeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

interface AuctionGridProps {
    auctions: IAuction[];
    loading?: boolean;
    /** How many skeletons to render while loading (matches page size). */
    skeletonCount?: number;
    onClearFilters?: () => void;
}

export function AuctionGrid({
    auctions,
    loading = false,
    skeletonCount = 6,
    onClearFilters,
}: AuctionGridProps) {
    // ── State 1: loading. Deterministic key set, no Math.random in render.
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: skeletonCount }, (_, i) => (
                    <AuctionCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // ── State 2: empty. Designed, helpful, and offers a way out.
    if (auctions.length === 0) {
        return (
            <EmptyState
                icon={Gavel}
                title="Nothing matched your search"
                description="Try another phrase or broaden your filters."
                action={
                    onClearFilters ? (
                        <Button variant="outline" size="sm" onClick={onClearFilters}>
                            Clear filters
                        </Button>
                    ) : undefined
                }
            />
        );
    }

    // ── State 3: data. Tight gaps = editorial density, not SaaS whitespace.
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {auctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
            ))}
        </div>
    );
}