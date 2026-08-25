/**
 * Purely presentational (no hooks, no state) → safe as a server component.
 * The card is an "auction lot", not a product card: lot number, current bid
 * and time remaining are the hierarchy. Gold is reserved for the bid figure.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { IAuction } from "@/types";
import { cn } from "@/lib/utils";
import { formatMoney, lotNumber } from "@/lib/formatting/format";
import { StatusBadge } from "@/components/auction/StatusBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { WatchlistButton } from "@/components/auction/WatchlistButton";
interface AuctionCardProps {
    auction: IAuction;
    className?: string;
}

export function AuctionCard({ auction, className }: AuctionCardProps) {
    /**
     * Defensive bid count: the backend may expose `bids` as an array, a number,
     * or omit it entirely depending on the endpoint. Never crash the card.
     */
    const raw = (auction as Record<string, unknown>).bids;
    const bidCount = Array.isArray(raw) ? raw.length : typeof raw === "number" ? raw : 0;

    // Current bid falls back to starting price before any bids exist.
    const displayBid = auction.currentBid ?? auction.startingPrice ?? 0;

    return (
        <Link
            href={`/auctions/${auction._id}`}
            className={cn("group block h-full", className)}
            aria-label={`View lot: ${auction.title}`}
        >
            <article
                className={cn(
                    "flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card",
                    // Thin border shift on hover — no shadows, no glow. Precision over noise.
                    "transition-colors duration-300 group-hover:border-primary/40"
                )}
            >
                {/* ── Visual ─ editorial photography with restrained motion (1.00→1.03) */}
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {auction.images?.[0] ? (
                        <img
                            src={auction.images[0]}
                            alt={auction.title}
                            loading="lazy" // Defer offscreen images → faster LCP for the grid.
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                    ) : (
                        // Graceful placeholder keeps the grid rhythm when imagery is missing.
                        <div className="flex h-full items-center justify-center font-serif text-lg text-muted-foreground/40">
                            No image
                        </div>
                    )}

                    {/* Status pinned top-left (LIVE / UPCOMING / ENDED / CANCELLED). */}
                    <div className="absolute left-3 top-3">
                        <StatusBadge status={auction.status} />
                    </div>

                    {/* Watchlist pinned top-right; client island inside a static card. */}
                    <div className="absolute right-3 top-3">
                        <WatchlistButton auctionId={auction._id} initialIsWatching={false} />
                    </div>
                </div>

                {/* ── Metadata  lot identity first, money second, time third. */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        <span>Lot {lotNumber(auction._id)}</span>
                        <span>{auction.category}</span>
                    </div>

                    <h3 className="line-clamp-1 font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
                        {auction.title}
                    </h3>

                    {/* Footer: the two numbers that matter — money and time. */}
                    <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                Current bid
                            </p>
                            {/* Gold reserved for value. tabular-nums keeps widths stable. */}
                            <p className="text-xl font-medium tabular-nums text-primary">
                                {formatMoney(displayBid)}
                            </p>
                        </div>

                        <div className="text-right text-xs text-muted-foreground">
                            <CountdownTimer endTime={auction.endTime} />
                            <p className="mt-1 tabular-nums">{bidCount} bids</p>
                        </div>
                    </div>
                </div>
            </article>

            {/* Hover affordance: quiet arrow, appears only on intent. */}
            <div className="pointer-events-none mt-2 flex justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowUpRight className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
            </div>
        </Link>
    );
}