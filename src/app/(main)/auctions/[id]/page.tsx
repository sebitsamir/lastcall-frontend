// src/app/(main)/auctions/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IAuction } from "@/types";
import { auctionService } from "@/services/auctionService";
import { getSocket } from "@/lib/socket";
import { BidForm } from "@/components/auction/BidForm";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionId = params.id as string;

    const [auction, setAuction] = useState<IAuction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch Initial Data
    useEffect(() => {
        const fetchAuction = async () => {
            try {
                const data = await auctionService.getAuctionById(auctionId);
                setAuction(data);
            } catch (error) {
                toast.error("Failed to load auction.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAuction();
    }, [auctionId]);

    // 2. Setup Real-Time Socket Listeners
    useEffect(() => {
        if (!auction) return;

        const socket = getSocket();

        // Join the specific room for this auction
        socket.emit("joinAuction", auctionId);

        // Listen for new bids from OTHER users
        const handleNewBid = (data: { currentBid: number; bidderName: string }) => {
            setAuction((prev) => prev ? { ...prev, currentBid: data.currentBid } : null);
            toast.info(`New bid placed by ${data.bidderName}!`);
        };

        // Listen for auction ending
        const handleAuctionEnded = (data: { status: string }) => {
            setAuction((prev) => prev ? { ...prev, status: data.status as any } : null);
            toast.warning("This auction has ended!");
        };

        socket.on("newBid", handleNewBid);
        socket.on("auctionEnded", handleAuctionEnded);

        // CRITICAL: Cleanup listeners when leaving the page
        return () => {
            socket.off("newBid", handleNewBid);
            socket.off("auctionEnded", handleAuctionEnded);
        };
    }, [auction, auctionId]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!auction) {
        return <div className="text-center py-20 text-slate-500">Auction not found.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{auction.title}</h1>
                    <p className="text-slate-500 mt-1">Category: {auction.category}</p>
                </div>
                <Badge variant={auction.status === "active" ? "success" : "default"} className="text-sm px-3 py-1">
                    {auction.status.toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image & Description */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="aspect-video w-full bg-slate-200 rounded-t-xl overflow-hidden">
                            {auction.images?.[0] ? (
                                <img src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                            )}
                        </div>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-2">Description</h2>
                            <p className="text-slate-600 whitespace-pre-wrap">{auction.description}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Bidding Engine */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-500 text-sm font-normal uppercase tracking-wider">Current Bid</CardTitle>
                            <div className="text-4xl font-bold text-primary-600">${auction.currentBid.toFixed(2)}</div>
                            <CardDescription className="flex items-center gap-2 mt-2">
                                <User className="h-4 w-4" />
                                {auction.currentHighestBidder ? "Bidder active" : "No bids yet"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-600">Time Remaining</span>
                                <CountdownTimer endTime={auction.endTime} />
                            </div>

                            {/* The Bidding Form */}
                            <BidForm
                                auction={auction}
                                onBidPlaced={(newBid) => setAuction({ ...auction, currentBid: newBid })}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}