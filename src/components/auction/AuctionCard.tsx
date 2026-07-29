// src/components/auction/AuctionCard.tsx
"use client";

import Link from "next/link";
import { IAuction } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CountdownTimer } from "./CountdownTimer";
import { Gavel } from "lucide-react";

interface AuctionCardProps {
    auction: IAuction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
    return (
        <Link href={`/auctions/${auction._id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                {/* Image Area */}
                <div className="relative h-48 w-full bg-slate-200">
                    {auction.images && auction.images.length > 0 ? (
                        <img
                            src={auction.images[0]}
                            alt={auction.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                            <Gavel className="h-12 w-12" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <Badge variant={auction.status === "active" ? "success" : "default"}>
                            {auction.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                {/* Content Area */}
                <CardContent className="flex-grow p-4 space-y-3">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{auction.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{auction.description}</p>
                </CardContent>

                {/* Footer Area: Price and Timer */}
                <CardFooter className="p-4 pt-0 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <p className="text-xs text-slate-500">Current Bid</p>
                        <p className="font-bold text-primary-600 text-lg">${auction.currentBid.toFixed(2)}</p>
                    </div>
                    <CountdownTimer endTime={auction.endTime} />
                </CardFooter>
            </Card>
        </Link>
    );
}