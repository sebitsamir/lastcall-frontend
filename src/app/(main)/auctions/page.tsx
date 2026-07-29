// src/app/(main)/auctions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IAuction } from "@/types";
import { auctionService } from "@/services/auctionService";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<IAuction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Fetch Data on Mount
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const data = await auctionService.getActiveAuctions();
                setAuctions(data);
            } catch (error) {
                console.error("Failed to fetch auctions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAuctions();
    }, []);

    // 2. Filter Auctions based on Search
    const filteredAuctions = auctions.filter((auction) =>
        auction.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Auctions</h1>
                    <p className="text-slate-500">Browse and bid on premium items in real-time.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search auctions..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Layout */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            ) : filteredAuctions.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    No active auctions found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAuctions.map((auction) => (
                        <AuctionCard key={auction._id} auction={auction} />
                    ))}
                </div>
            )}
        </div>
    );
}