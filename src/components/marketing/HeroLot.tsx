/**
 * HERO LOT
 * The hero's right half IS an auction. Instead of stock marketing imagery,
 * we feature the most urgent live lot — the interface demonstrates the
 * product by being the product.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { IAuction } from "@/types";
import { formatMoney, lotNumber } from "@/lib/formatting/format";
import { StatusBadge } from "@/components/auction/StatusBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { Button } from "@/components/ui/button";

interface HeroLotProps {
    auction: IAuction;
}

export function HeroLot({ auction }: HeroLotProps) {
    const displayBid = auction.currentBid ?? auction.startingPrice ?? 0;

    return (
        <Link
            href={`/auctions/${auction._id}`}
            className="group block"
            aria-label={`View featured lot: ${auction.title}`}
        >
            <article className="border border-border bg-card transition-colors duration-300 group-hover:border-primary/40">
                {/* ── Editorial photography: generous, unhurried, sharp ── */}
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {auction.images?.[0] ? (
                        <img
                            src={auction.images[0]}
                            alt={auction.title}
                            // Above the fold: eager-load the hero image for a strong LCP.
                            loading="eager"
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center font-serif text-lg text-muted-foreground/40">
                            No image
                        </div>
                    )}

                    {/* Status plate, top-left — same grammar as the lot cards */}
                    <div className="absolute left-4 top-4">
                        <StatusBadge status={auction.status} dot />
                    </div>
                </div>

                {/* ── The lot's vital signs ── */}
                <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <span>Lot {lotNumber(auction._id)}</span>
                        <span>{auction.category}</span>
                    </div>

                    <h3 className="font-serif text-2xl leading-tight text-foreground transition-colors group-hover:text-primary">
                        {auction.title}
                    </h3>

                    <div className="flex items-end justify-between border-t border-border pt-4">
                        {/* Value: the one number allowed to be loud */}
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Current Bid
                            </p>
                            <p className="text-3xl font-medium tabular-nums text-primary">
                                {formatMoney(displayBid)}
                            </p>
                        </div>

                        {/* Time: quiet urgency */}
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Ends In
                            </p>
                            <CountdownTimer endTime={auction.endTime} className="text-lg" />
                        </div>
                    </div>

                    {/* CTA: outline, not primary — the hero's primary CTA lives on the left */}
                    <Button variant="outline" className="w-full" asChild>
                        <span>
                            View Lot
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                        </span>
                    </Button>
                </div>
            </article>
        </Link>
    );
}