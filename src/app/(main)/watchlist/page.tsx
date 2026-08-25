// src/app/(main)/watchlist/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WATCHLIST PAGE
 * Fetches watchlist + my-bids independently (allSettled): a bids failure
 * degrades to neutral states, it never blanks the board.
 * Unwatch is optimistic with rollback — removing feels instant, and a
 * server failure restores the row and explains itself.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import type { IAuction } from "@/types";
import { watchlistApi } from "@/lib/api/watchlist";
import { usersApi } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";
import {
    deriveWatchState,
    sortWatchlist,
    ENDING_SOON_MS,
} from "@/lib/watchlist/state";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { WatchListRow } from "@/components/watchlist/WatchListRow";

export default function WatchlistPage() {
    const { user } = useAuthStore();
    const userId = (user as { _id?: string } | null)?._id;

    const [lots, setLots] = useState<IAuction[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [pendingId, setPendingId] = useState<string | null>(null);

    /** Auction ids the user has bid on — powers "outbid" detection. */
    const [bidIds, setBidIds] = useState<Set<string>>(new Set());
    const requestId = useRef(0); // stale-response guard

    const load = useCallback(() => {
        const id = ++requestId.current;
        setStatus("loading");

        // Independent fates: watchlist is required; bids are an enhancement.
        Promise.allSettled([watchlistApi.list(), usersApi.myBids()]).then(
            ([watchResult, bidsResult]) => {
                if (id !== requestId.current) return;

                if (watchResult.status === "rejected") {
                    setStatus("error");
                    return;
                }

                // Degrade gracefully: no bids data → no outbid verdicts, nothing crashes.
                if (bidsResult.status === "fulfilled") {
                    bidIds.current = new Set(
                        bidsResult.value
                            .map((b) => b.auction?._id)
                            .filter((v): v is string => Boolean(v))
                    );
                }

                setLots(sortWatchlist(watchResult.value));
                setStatus("ready");
            }
        );
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    /* ── Optimistic unwatch with rollback ────────────────────────────────── */
    const handleUnwatch = async (auctionId: string) => {
        const removed = lots.find((l) => l._id === auctionId);
        if (!removed) return;

        // 1. Optimistic removal — the board responds instantly.
        setLots((prev) => prev.filter((l) => l._id !== auctionId));
        setPendingId(auctionId);

        try {
            await watchlistApi.toggle(auctionId);
            toast.success("Removed from watchlist");
        } catch {
            // 2. Rollback + explanation: the UI never lies about server truth.
            setLots((prev) => sortWatchlist([removed, ...prev]));
            toast.error("Couldn't update your watchlist");
        } finally {
            setPendingId(null);
        }
    };

    /* ── Derived board stats ─────────────────────────────────────────────── */
    const endingSoonCount = useMemo(
        () =>
            lots.filter(
                (l) =>
                    l.status === "active" &&
                    new Date(l.endTime).getTime() - Date.now() <= ENDING_SOON_MS
            ).length,
        [lots]
    );

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 md:px-8">
            <SectionHeading
                overline="Your positions"
                title="Watchlist"
                description="Every lot you're following, soonest-ending first."
            />

            {/* Board stats: counts, not decoration */}
            {status === "ready" && lots.length > 0 && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                    {lots.length} Lots Watched
                    {endingSoonCount > 0 && (
                        <span className="text-accent"> · {endingSoonCount} Ending Soon</span>
                    )}
                </p>
            )}

            {status === "loading" && <WatchlistSkeleton />}

            {status === "error" && (
                <ErrorState
                    title="Couldn't load your watchlist"
                    action={<Button variant="outline" size="sm" onClick={load}>Retry</Button>}
                />
            )}

            {status === "ready" && lots.length === 0 && (
                <EmptyState
                    icon={Heart}
                    title="Your watchlist is empty"
                    description="When something catches your eye, save it here and we'll keep track of it."
                    action={<Button variant="outline" size="sm" asChild><Link href="/auctions">Explore Auctions</Link></Button>}
                />
            )}

            {status === "ready" && lots.length > 0 && (
                <ol className="divide-y divide-border border border-border bg-card">
                    {lots.map((auction) => (
                        <WatchListRow
                            key={auction._id}
                            auction={auction}
                            state={deriveWatchState(auction, userId, bidIds.current)}
                            busy={pendingId === auction._id}
                            onUnwatch={handleUnwatch}
                        />
                    ))}
                </ol>
            )}
        </div>
    );
}

/** Mirrors row geometry so the load-in never jumps. */
function WatchlistSkeleton() {
    return (
        <div className="divide-y divide-border border border-border bg-card">
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-14 w-14" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
            ))}
        </div>
    );
}