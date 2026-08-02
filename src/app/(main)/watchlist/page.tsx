"use client";

import { useEffect, useState } from "react";
import { IAuction } from "@/types";
import { watchlistService } from "@/services/watchlistService";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Loader2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function WatchlistPage() {
    const [auctions, setAuctions] = useState<IAuction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const data = await watchlistService.getMyWatchlist();
                setAuctions(Array.isArray(data) ? data : []);
            } catch (error) {
                setAuctions([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWatchlist();
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 space-y-10 animate-fade-up">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                        <Heart className="h-5 w-5 text-gold fill-current" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium">Your Collection</p>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground">My Watchlist</h1>
                <p className="text-muted-foreground max-w-2xl">Track the exceptional pieces you're interested in.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-10 w-10 animate-spin text-gold" />
                </div>
            ) : auctions.length === 0 ? (
                <Card className="border-border bg-card">
                    <CardContent className="p-16 text-center space-y-4">
                        <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                        <h3 className="font-display text-2xl text-foreground">Your watchlist is empty</h3>
                        <p className="text-muted-foreground">Start exploring and heart the items you love!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {auctions.map((auction, index) => (
                        <AuctionCard key={auction._id} auction={auction} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}