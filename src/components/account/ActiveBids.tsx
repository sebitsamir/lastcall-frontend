// src/components/account/ActiveBids.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * ACTIVE BIDS
 * Your open positions. Each row answers three questions instantly:
 *   what am I in on, am I winning, and how long do I have?
 * "Bid again" is the recovery action for outbid positions.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Gavel } from "lucide-react";

import { usersApi, type MyBid } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";
import { formatMoney } from "@/lib/formatting/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CountdownTimer } from "@/components/auction/CountdownTimer";

export function ActiveBids() {
    const { user } = useAuthStore();
    const userId = (user as { _id?: string } | null)?._id;

    const [bids, setBids] = useState<MyBid[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const requestId = useRef(0); // stale-response guard

    const load = useCallback(() => {
        const id = ++requestId.current;
        setStatus("loading");
        usersApi
            .myBids()
            .then((result) => {
                if (id !== requestId.current) return;
                // Only live positions belong here; history lives in the ledger.
                setBids(result.filter((b) => b.auction?.status === "active"));
                setStatus("ready");
            })
            .catch(() => {
                if (id !== requestId.current) return;
                setStatus("error");
            });
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (status === "loading") {
        return (
            <div className="space-y-0 divide-y divide-border border border-border bg-card">
                {Array.from({ length: 2 }, (_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (status === "error") {
        return (
            <ErrorState
                title="Couldn't load your bids"
                action={<Button variant="outline" size="sm" onClick={load}>Retry</Button>}
            />
        );
    }

    if (bids.length === 0) {
        return (
            <EmptyState
                icon={Gavel}
                title="No active bids"
                description="When you bid on a lot, your position shows up here."
                action={<Button variant="outline" size="sm" asChild><Link href="/auctions">Explore Auctions</Link></Button>}
            />
        );
    }

    return (
        <ol className="divide-y divide-border border border-border bg-card">
            {bids.map((bid) => {
                const auction = bid.auction!;

                /**
                 * Winning detection: prefer the backend's word; otherwise compare
                 * highest-bidder id, falling back to amount equality.
                 */
                const winning =
                    bid.status === "winning" ||
                    (bid.status
                        ? false
                        : ((auction.highestBidder as { _id?: string } | string | undefined) &&
                            typeof auction.highestBidder === "object"
                            ? auction.highestBidder._id === userId
                            : auction.currentBid === bid.amount));

                return (
                    <li key={bid._id} className="flex flex-wrap items-center gap-4 p-4">
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/auctions/${auction._id}`}
                                className="block truncate font-serif text-base text-foreground transition-colors hover:text-primary"
                            >
                                {auction.title}
                            </Link>
                            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                                Your bid {formatMoney(bid.amount)} · Current {formatMoney(auction.currentBid ?? 0)}
                            </p>
                        </div>

                        {/* Position: unmistakable at a glance */}
                        {winning ? (
                            <Badge variant="success">Winning</Badge>
                        ) : (
                            <Badge variant="cancelled">Outbid</Badge>
                        )}

                        <CountdownTimer endTime={auction.endTime} className="text-sm" />

                        {/* Recovery action for outbid positions */}
                        {!winning && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/auctions/${auction._id}`}>Bid Again</Link>
                            </Button>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}