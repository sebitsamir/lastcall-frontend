import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { IAuction } from "@/types";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/formatting/format";

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

    const href = `/auctions/${auction._id}`;

    return (
        <article
            className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-card",
                "transition-[transform,border-color,box-shadow] duration-[350ms] ease-out-soft",
                "hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-lift",
                className
            )}
        >
            {/* Image — the whole surface is a lot link; the chip + heart sit above it */}
            <Link
                href={href}
                aria-label={`View lot: ${auction.title}`}
                className="relative block aspect-[4/3] overflow-hidden bg-secondary"
            >
                <AuctionImage
                    src={auction.images?.[0]}
                    alt={auction.title}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                />
            </Link>

            <StatusBadge
                status={auction.status}
                startTime={auction.startTime}
                endTime={auction.endTime}
                className="absolute left-3 top-3 z-10 bg-card max-[560px]:left-2 max-[560px]:top-2"
            />

            <WatchlistButton
                auctionId={auction._id}
                initialIsWatching={false}
                className="absolute right-3 top-3 z-10 max-[560px]:right-1.5 max-[560px]:top-1.5 max-[560px]:h-9 max-[560px]:w-9"
            />

            <div className="flex flex-1 flex-col gap-3 p-[18px] max-[560px]:gap-2 max-[560px]:p-3">
                <span className="text-xs font-medium text-muted-foreground max-[560px]:text-[11px]">
                    {auction.category}
                </span>

                <h3 className="line-clamp-2 text-[17px] font-semibold leading-[1.3] tracking-[-0.01em] max-[560px]:min-h-[2.6em] max-[560px]:text-sm">
                    <Link href={href} className="transition-colors hover:text-primary-text">
                        {auction.title}
                    </Link>
                </h3>

                <div className="flex items-end justify-between gap-3 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-0.5">
                    <div>
                        <span className="block text-xs font-medium text-muted-foreground">Current bid</span>
                        <b className="block text-2xl font-[650] leading-[1.1] tracking-[-0.02em] tabular-nums text-primary-text max-[560px]:text-lg">
                            {formatMoney(displayBid)}
                        </b>
                    </div>

                    <span className="text-[13px] tabular-nums text-muted-foreground max-[560px]:text-xs">
                        {bidCount} {bidCount === 1 ? "bid" : "bids"}
                    </span>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5 max-[560px]:pt-2.5">
                    <CountdownTimer
                        startTime={auction.startTime}
                        endTime={auction.endTime}
                        icon
                        className="text-sm max-[560px]:text-[12.5px]"
                    />

                    <Link
                        href={href}
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-text max-[560px]:hidden"
                    >
                        Bid now
                        <ArrowRight
                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                            strokeWidth={1.7}
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </div>
        </article>
    );
}
