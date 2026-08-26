// src/components/bidding/MobileBidBar.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * MOBILE BID BAR
 * On touch devices the bid panel can sit far below the fold. This sticky
 * bar (above the bottom nav) keeps the two things that matter — current
 * bid and the primary action — always one thumb-tap away.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { formatMoney } from "@/lib/formatting/format";
import { Button } from "@/components/ui/button";

interface MobileBidBarProps {
    currentBid: number;
    visible: boolean;      // only for ACTIVE auctions
    onBidClick: () => void; // scrolls the bid panel into view
}

export function MobileBidBar({ currentBid, visible, onBidClick }: MobileBidBarProps) {
    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md md:hidden">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Current bid
                    </p>
                    <p className="text-lg font-medium tabular-nums text-primary">
                        {formatMoney(currentBid)}
                    </p>
                </div>
                <Button onClick={onBidClick}>Place Bid</Button>
            </div>
        </div>
    );
}