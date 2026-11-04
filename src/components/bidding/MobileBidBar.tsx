// src/components/bidding/MobileBidBar.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * MOBILE BID BAR
 * On touch devices the bid panel can sit far below the fold. This floating
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
        <div className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-[54] flex items-center justify-between gap-3 rounded-[22px] border border-border-strong bg-card py-2.5 pl-[18px] pr-2.5 shadow-lift md:hidden">
            <div>
                <span className="block text-xs font-medium text-muted-foreground">Current bid</span>
                <p className="text-[22px] font-[650] leading-[1.1] tracking-[-0.02em] tabular-nums text-primary-text">
                    {formatMoney(currentBid)}
                </p>
            </div>
            <Button size="lg" onClick={onBidClick}>Place Bid</Button>
        </div>
    );
}
