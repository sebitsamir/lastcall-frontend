"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IAuction } from "@/types";
import { auctionService } from "@/services/auctionService";
import { getSocket } from "@/lib/socket";
import { BidForm } from "@/components/auction/BidForm";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionId = params.id as string;
    const [auction, setAuction] = useState<IAuction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (!auction) return;
        const socket = getSocket();
        socket.emit("joinAuction", auctionId);
        const handleNewBid = (data: { currentBid: number; bidderName: string }) => {
            setAuction((prev) => prev ? { ...prev, currentBid: data.currentBid } : null);
            toast.info(`New bid by ${data.bidderName}`);
        };
        socket.on("newBid", handleNewBid);
        return () => { socket.off("newBid", handleNewBid); };
    }, [auction, auctionId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
            </div>
        );
    }

    if (!auction) return <div className="text-center py-20 text-muted-foreground">Auction not found.</div>;

    return (
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 animate-fade-up">
            {/* Breadcrumb / Status - Crisp, solid */}
            <div className="flex items-center gap-3 mb-8">
                <Badge variant="outline" className="border-gold/40 text-gold bg-gold/5 px-3 py-1 font-medium">
                    {(auction.status || "pending").toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
                    {auction.category}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Image & Description */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card"
                    >
                        {auction.images?.[0] ? (
                            <img src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                                No Image Available
                            </div>
                        )}
                    </motion.div>

                    <div className="space-y-4">
                        <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
                            {auction.title}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                            {auction.description}
                        </p>
                    </div>
                </div>

                {/* Right: Bidding Engine (Sticky) */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="sticky top-24"
                    >
                        <Card className="border-border bg-card overflow-hidden">
                            {/* Solid, crisp top accent line (NO gradient) */}
                            <div className="h-px w-full bg-gold/50" />

                            <CardContent className="p-8 space-y-8">
                                {/* Current Bid Display - Solid gold, authoritative */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                                        Current Highest Bid
                                    </p>
                                    <p className="font-display text-5xl font-semibold text-gold">
                                        ${(auction.currentBid || 0).toLocaleString()}
                                    </p>
                                </div>

                                {/* Timer - Clean, structured */}
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 border border-border">
                                    <Clock className="h-5 w-5 text-gold" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">
                                            Auction Ends In
                                        </p>
                                        <CountdownTimer endTime={auction.endTime} className="text-lg font-semibold text-foreground" />
                                    </div>
                                </div>

                                {/* Bid Form */}
                                <BidForm
                                    auction={auction}
                                    onBidPlaced={(newBid) => setAuction({ ...auction, currentBid: newBid })}
                                />

                                {/* Seller Info - Solid background, crisp border */}
                                <div className="pt-6 border-t border-border flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gold" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {auction.seller?.name || "Verified Seller"}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                                            <p className="text-xs text-muted-foreground">Authenticated & Verified</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}