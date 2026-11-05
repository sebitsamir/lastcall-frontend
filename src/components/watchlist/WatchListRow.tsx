// src/components/watchlist/WatchlistRow.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WATCHLIST ROW
 * A position, not a product card: thumbnail → identity → money → time →
 * state → exit. Each row is its own card so the board scans quickly.
 * The heart is a real <button> outside the <Link> — no nested interactives.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import type { IAuction } from "@/types";
import type { WatchState } from "@/lib/watchlist/state";
import { formatMoney } from "@/lib/formatting/format";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { AuctionImage } from "@/components/auction/AuctionImage";

/** State → badge voice. One map; the row never decides colors itself. */
const STATE_BADGE: Record<WatchState, { label: string; variant: "success" | "cancelled" | "red" | "neutral" | "ended"; dot?: boolean }> = {
    winning: { label: "Winning", variant: "success" },
    outbid: { label: "Outbid", variant: "cancelled" },
    endingSoon: { label: "Ending Soon", variant: "red" },
    watching: { label: "Watching", variant: "neutral" },
    ended: { label: "Ended", variant: "ended" },
    cancelled: { label: "Cancelled", variant: "cancelled" },
};

interface WatchlistRowProps {
    auction: IAuction;
    state: WatchState;
    busy?: boolean;          // this row's unwatch request is in flight
    onUnwatch: (id: string) => void;
}

export function WatchListRow({ auction, state, busy, onUnwatch }: WatchlistRowProps) {
    const badge = STATE_BADGE[state];

    return (
        <li className="flex items-center gap-3 rounded-card border border-border bg-card p-3 transition-colors hover:border-border-strong sm:gap-4">
            {/* ── Identity: thumb + lot meta, the clickable surface ── */}
            <Link
                href={`/auctions/${auction._id}`}
                className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
                aria-label={`View lot: ${auction.title}`}
            >
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-secondary sm:h-[84px] sm:w-[84px]">
                    <AuctionImage
                        src={auction.images?.[0]}
                        alt=""
                        sizes="84px"
                        fallback="compact"
                    />
                </div>

                <div className="min-w-0 space-y-1.5">
                    <Badge variant={badge.variant} dot={badge.dot}>
                        {badge.label}
                    </Badge>
                    <h3 className="truncate text-base font-semibold transition-colors hover:text-primary-text">
                        {auction.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                        <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} icon />
                        {/* Money collapses under the title on the tightest screens */}
                        <span className="font-semibold tabular-nums text-primary-text sm:hidden">
                            {formatMoney(auction.currentBid ?? auction.startingPrice ?? 0)}
                        </span>
                    </div>
                </div>
            </Link>

            {/* ── Money ── */}
            <span className="hidden shrink-0 pr-2 text-lg font-[650] tracking-[-0.02em] tabular-nums text-primary-text sm:block">
                {formatMoney(auction.currentBid ?? auction.startingPrice ?? 0)}
            </span>

            {/* ── Exit: filled heart = watching; one tap releases the lot ── */}
            <button
                onClick={() => onUnwatch(auction._id)}
                disabled={busy}
                aria-label={`Remove ${auction.title} from watchlist`}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-destructive transition-colors hover:bg-secondary disabled:opacity-40"
            >
                <Heart className="h-5 w-5 fill-current" strokeWidth={1.7} />
            </button>
        </li>
    );
}
