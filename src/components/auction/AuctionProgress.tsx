"use client";

import { useNow } from "@/hooks/useNow";

interface AuctionProgressProps {
    startTime?: string | Date;
    endTime: string | Date;
}

/** Elapsed share of the auction window, rendered as the design's thin gold bar. */
export function AuctionProgress({ startTime, endTime }: AuctionProgressProps) {
    const now = useNow(1_000);

    const end = new Date(endTime).getTime();
    const start = startTime ? new Date(startTime).getTime() : NaN;

    // Without a usable start time there is nothing honest to show.
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

    const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

    return (
        <div
            className="h-1.5 overflow-hidden rounded-[3px] bg-surface-3"
            role="progressbar"
            aria-label="Auction time elapsed"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
        >
            <b
                className="block h-full rounded-[3px] bg-primary shadow-[0_0_12px_hsl(var(--gold)/0.45)] transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct.toFixed(1)}%` }}
            />
        </div>
    );
}
