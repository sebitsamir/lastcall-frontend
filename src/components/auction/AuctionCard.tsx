"use client";

import Link from "next/link";
import { IAuction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CountdownTimer } from "./CountdownTimer";
import { WatchlistButton } from "./WatchlistButton";
import { ArrowUpRight } from "lucide-react";

interface AuctionCardProps {
    auction: IAuction;
    index?: number;
}

export function AuctionCard({ auction, index = 0 }: AuctionCardProps) {
    return (
        <Link href={`/auctions/${auction._id}`}>
            <Card
                className={`group relative overflow-hidden border border-border bg-card hover:border-gold/40 transition-all duration-300 animate-fade-up`}
                style={{ animationDelay: `${index * 0.08}s` }}
            >
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {auction.images && auction.images.length > 0 ? (
                        <img
                            src={auction.images[0]}
                            alt={auction.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No Image
                        </div>
                    )}

                    {/* SOLID dark overlay for text readability (NO gradients) */}
                    <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status Badge - Solid, crisp */}
                    <div className="absolute left-3 top-3">
                        <Badge
                            variant={auction.status === "active" ? "default" : "secondary"}
                            className="bg-background/80 text-foreground border border-border backdrop-blur-sm"
                        >
                            {(auction.status || "pending").toUpperCase()}
                        </Badge>
                    </div>

                    {/* Watchlist */}
                    <div className="absolute right-3 top-3">
                        <WatchlistButton auctionId={auction._id} initialIsWatching={false} />
                    </div>

                    {/* Arrow indicator - Solid border, no glow */}
                    <div className="absolute right-3 bottom-3 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 bg-background/80 backdrop-blur-sm">
                            <ArrowUpRight className="h-4 w-4 text-gold" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 space-y-3">
                    <div className="space-y-1.5">
                        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-gold transition-colors duration-300">
                            {auction.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {auction.description}
                        </p>
                    </div>
                </CardContent>

                {/* Footer */}
                <CardFooter className="px-5 pb-5 pt-0 border-t border-border flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-1">
                            Current Bid
                        </p>
                        <p className="font-display text-2xl font-semibold text-gold">
                            ${(auction.currentBid || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <CountdownTimer endTime={auction.endTime} />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}