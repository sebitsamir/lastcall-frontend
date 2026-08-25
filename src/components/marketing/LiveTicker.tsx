/**
 * LIVE TICKER
 * The heartbeat of the marketplace. A seamless marquee of live lots that
 * immediately communicates: "LastCall is alive."
 *
 * Technique: the list is rendered twice inside a `w-max` flex track and the
 * track translates -50%. Because both halves are identical, the loop point
 * is invisible. The duplicate is aria-hidden so screen readers hear one list.
 */
"use client";

import Link from "next/link";
import type { IAuction } from "@/types";
import { formatMoney } from "@/lib/formatting/format";
import { CountdownTimer } from "@/components/auction/CountdownTimer";

interface LiveTickerProps {
    auctions: IAuction[]; // Expected: active auctions only, pre-sorted by urgency.
}

export function LiveTicker({ auctions }: LiveTickerProps) {
    // Never render an empty strip — silence is fine when nothing is live.
    if (auctions.length === 0) return null;

    return (
        <section
            className="relative overflow-hidden border-y border-border bg-card/50"
            aria-label="Live auctions ticker"
        >
            {/* Hard-edged "LIVE NOW" plate. No gradients — editorial, not decorative. */}
            <div className="absolute left-0 top-0 z-10 flex h-full items-center border-r border-border bg-background px-4">
                <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-primary" />
                    Live Now
                </span>
            </div>

            {/* Marquee track: pauses on hover so users can actually read a lot. */}
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                <TickerRow auctions={auctions} />
                {/* Duplicate for the seamless loop; hidden from assistive tech. */}
                <TickerRow auctions={auctions} hidden />
            </div>
        </section>
    );
}

/** One pass of the list. `hidden` marks the decorative duplicate. */
function TickerRow({ auctions, hidden = false }: { auctions: IAuction[]; hidden?: boolean }) {
    return (
        <div className="flex" aria-hidden={hidden || undefined}>
            {auctions.map((auction) => (
                <Link
                    key={`${auction._id}${hidden ? "-dup" : ""}`} // Stable, collision-free keys across both passes.
                    href={`/auctions/${auction._id}`}
                    className="flex items-center gap-3 whitespace-nowrap border-r border-border px-6 py-3 transition-colors hover:bg-white/5"
                    tabIndex={hidden ? -1 : undefined} // Duplicate is not focusable.
                >
                    {/* Lot identity */}
                    <span className="text-sm text-foreground">{auction.title}</span>

                    {/* Value — gold, tabular, precise */}
                    <span className="text-sm font-medium tabular-nums text-primary">
                        {formatMoney(auction.currentBid ?? auction.startingPrice ?? 0)}
                    </span>

                    {/* Time pressure — the ticker's emotional engine */}
                    <CountdownTimer endTime={auction.endTime} className="text-xs" />
                </Link>
            ))}
        </div>
    );
}