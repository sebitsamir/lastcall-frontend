import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { IAuction } from "@/types";
import { cn } from "@/lib/utils";
import {
    formatMoney,
    lotNumber,
} from "@/lib/formatting/format";

import { StatusBadge } from "@/components/auction/StatusBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { WatchlistButton } from "@/components/auction/WatchlistButton";
import { AuctionImage } from "@/components/auction/AuctionImage";

interface AuctionCardProps {
    auction: IAuction;
    className?: string;
}

export function AuctionCard({
    auction,
    className,
}: AuctionCardProps) {
    const raw = (
        auction as Record<string, unknown>
    ).bids;

    const bidCount = Array.isArray(raw)
        ? raw.length
        : typeof raw === "number"
          ? raw
          : 0;

    const displayBid =
        auction.currentBid ??
        auction.startingPrice ??
        0;

    return (
        <Link
            href={`/auctions/${auction._id}`}
            className={cn(
                "group block h-full",
                className
            )}
            aria-label={`View lot: ${auction.title}`}
        >
            <article
                className={cn(
                    "flex h-full flex-col overflow-hidden rounded-sm",
                    "border border-border bg-card",
                    "transition-colors duration-300",
                    "group-hover:border-primary/40"
                )}
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <AuctionImage
                        src={auction.images?.[0]}
                        alt={auction.title}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-[1.03]
                        "
                    />

                    <div className="absolute left-3 top-3 z-10">
                        <StatusBadge
                            status={auction.status}
                        />
                    </div>

                    <div className="absolute right-3 top-3 z-10">
                        <WatchlistButton
                            auctionId={auction._id}
                            initialIsWatching={false}
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                    <div
                        className="
                            flex items-center justify-between
                            text-[10px] uppercase
                            tracking-[0.15em]
                            text-muted-foreground
                        "
                    >
                        <span>
                            Lot {lotNumber(auction._id)}
                        </span>

                        <span>
                            {auction.category}
                        </span>
                    </div>

                    <h3
                        className="
                            line-clamp-1
                            font-serif text-lg leading-snug
                            text-foreground
                            transition-colors
                            group-hover:text-primary
                        "
                    >
                        {auction.title}
                    </h3>

                    <div
                        className="
                            mt-auto flex items-end justify-between
                            border-t border-border pt-3
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-[10px] uppercase
                                    tracking-[0.15em]
                                    text-muted-foreground
                                "
                            >
                                Current bid
                            </p>

                            <p
                                className="
                                    text-xl font-medium
                                    tabular-nums text-primary
                                "
                            >
                                {formatMoney(displayBid)}
                            </p>
                        </div>

                        <div className="text-right text-xs text-muted-foreground">
                            <CountdownTimer
                                endTime={auction.endTime}
                            />

                            <p className="mt-1 tabular-nums">
                                {bidCount}{" "}
                                {bidCount === 1
                                    ? "bid"
                                    : "bids"}
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            <div
                className="
                    pointer-events-none mt-2 flex justify-end
                    opacity-0 transition-opacity duration-300
                    group-hover:opacity-100
                "
            >
                <ArrowUpRight
                    className="h-3.5 w-3.5 text-primary"
                    strokeWidth={1.5}
                />
            </div>
        </Link>
    );
}