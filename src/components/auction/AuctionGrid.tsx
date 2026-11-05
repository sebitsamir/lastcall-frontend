"use client";

/**
 * Owns the three visual states of any collection:
 *   loading → geometry-matched skeletons
 *   empty   → designed EmptyState with a recovery action
 *   data    → the lot grid
 * Pages stay thin; they just hand over data + flags.
 */
import { Gavel } from "lucide-react";
import { motion } from "framer-motion";
import { useNow } from "@/hooks/useNow";
import type { IAuction } from "@/types";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { AuctionCardSkeleton } from "@/components/auction/AuctionCardSkeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isOpenLot } from "@/lib/auction/status";

/** Two columns on phones, fluid 260px+ tracks from 560px up (design grid). */
const GRID =
    "grid grid-cols-2 gap-3 max-[359px]:grid-cols-1 min-[560px]:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] min-[560px]:gap-5";

interface AuctionGridProps {
    auctions: IAuction[];
    className?: string;
    loading?: boolean;
    /** How many skeletons to render while loading (matches page size). */
    skeletonCount?: number;
    onClearFilters?: () => void;
    /** When set, ended lots are dropped from the public floor. */
    now?: number;
    /** Seller/account surfaces keep ended lots. */
    keepEnded?: boolean;
}

export function AuctionGrid({
    auctions,
    loading = false,
    skeletonCount = 6,
    onClearFilters,
    now,
    keepEnded = false,
    className,
}: AuctionGridProps) {
    const tick = useNow(1_000);
    const clock = now ?? tick;

    if (loading) {
        return (
            <div className={cn(GRID, className)}>
                {Array.from({ length: skeletonCount }, (_, i) => (
                    <AuctionCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    const lots = keepEnded
        ? auctions
        : auctions.filter((auction) => isOpenLot(auction, clock));

    // ── State 2: empty. Designed, helpful, and offers a way out.
    if (lots.length === 0) {
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

    // ── State 3: data.
    return (
        <div className={cn(GRID, className)}>
            {lots.map((auction, index) => (
                <motion.div
                    key={auction._id}
                    className="h-full"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.42,
                        delay: Math.min(index, 8) * 0.05,
                        ease: [0.2, 0.7, 0.2, 1],
                    }}
                >
                    <AuctionCard auction={auction} />
                </motion.div>
            ))}
        </div>
    );
}