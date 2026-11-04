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
            className="relative overflow-hidden rounded-full border border-border bg-card"
            aria-label="Live auctions ticker"
        >
            {/* "Live" plate pinned to the left edge of the strip. */}
            <div className="absolute left-0 top-0 z-10 flex h-full items-center border-r border-border bg-card px-3 sm:px-5">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-live">
                    <span className="relative grid h-2 w-2 place-items-center" aria-hidden="true">
                        <span className="animate-live-ping absolute inset-0 rounded-full bg-current" />
                        <span className="relative h-2 w-2 rounded-full bg-current" />
                    </span>
                    Live now
                </span>
            </div>

            {/* Marquee track: pauses on hover so users can actually read a lot. */}
            <div className="flex w-max animate-marquee pl-24 hover:[animation-play-state:paused] sm:pl-32">
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
                    className="flex items-center gap-3 whitespace-nowrap border-r border-border px-6 py-3 transition-colors hover:bg-secondary"
                    tabIndex={hidden ? -1 : undefined} // Duplicate is not focusable.
                >
                    {/* Lot identity */}
                    <span className="text-sm font-medium text-foreground">{auction.title}</span>

                    {/* Value — gold, tabular, precise */}
                    <span className="text-sm font-semibold tabular-nums text-primary-text">
                        {formatMoney(auction.currentBid ?? auction.startingPrice ?? 0)}
                    </span>

                    {/* Time pressure — the ticker's emotional engine */}
                    <CountdownTimer endTime={auction.endTime} className="text-xs" />
                </Link>
            ))}
        </div>
    );
}
