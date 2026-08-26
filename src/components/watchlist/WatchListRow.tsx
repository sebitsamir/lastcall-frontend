// src/components/watchlist/WatchlistRow.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WATCHLIST ROW
 * A position, not a product card: thumbnail → identity → money → time →
 * state → exit. Hairline-separated rows keep the board scannable at speed.
 * The heart is a real <button> outside the <Link> — no nested interactives.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import type { IAuction } from "@/types";
import type { WatchState } from "@/lib/watchlist/state";
import { formatMoney, lotNumber } from "@/lib/formatting/format";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";

/** State → badge voice. One map; the row never decides colors itself. */
const STATE_BADGE: Record<WatchState, { label: string; variant: "success" | "cancelled" | "live" | "neutral" | "ended"; dot?: boolean }> = {
    winning: { label: "Winning", variant: "success" },
    outbid: { label: "Outbid", variant: "cancelled" },
    endingSoon: { label: "Ending Soon", variant: "live", dot: true },
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
        <li className="flex items-center gap-4 p-4">
            {/* ── Identity: thumb + lot meta, the clickable surface ── */}
            <Link
                href={`/auctions/${auction._id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
                aria-label={`View lot: ${auction.title}`}
            >
                <div className="h-14 w-14 shrink-0 overflow-hidden border border-border bg-secondary">
                    {auction.images?.[0] ? (
                        <img src={auction.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full" aria-hidden />
                    )}
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        Lot {lotNumber(auction._id)} · {auction.category}
                    </p>
                    <h3 className="truncate font-serif text-base text-foreground transition-colors hover:text-primary">
                        {auction.title}
                    </h3>
                </div>
            </Link>

            {/* ── Money: gold, tabular; hidden on the tightest screens ── */}
            <span className="hidden shrink-0 text-sm font-medium tabular-nums text-primary sm:block">
                {formatMoney(auction.currentBid ?? auction.startingPrice ?? 0)}
            </span>

            {/* ── Time: the row's pulse ── */}
            <CountdownTimer endTime={auction.endTime} className="w-20 shrink-0 text-right text-sm" />

            {/* ── Position verdict ── */}
            <Badge variant={badge.variant} dot={badge.dot} className="hidden shrink-0 md:inline-flex">
                {badge.label}
            </Badge>

            {/* ── Exit: filled heart = watching; one tap releases the lot ── */}
            <button
                onClick={() => onUnwatch(auction._id)}
                disabled={busy}
                aria-label={`Remove ${auction.title} from watchlist`}
                className="shrink-0 p-2 text-primary transition-colors hover:text-destructive disabled:opacity-40"
            >
                <Heart className="h-4 w-4 fill-current" strokeWidth={1.5} />
            </button>
        </li>
    );
}