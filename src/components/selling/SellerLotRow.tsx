// src/components/selling/SellerLotRow.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * SELLER LOT ROW
 * A single row in the seller's management table. 
 * Actions are strictly gated by the lot's state:
 *   - Upcoming: View, Edit, Cancel
 *   - Active:   View, Cancel (Edit is locked to protect bidders)
 *   - Ended/Cancelled: View only
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import Link from "next/link";
import { Edit, Eye, X } from "lucide-react";

import type { IAuction } from "@/types";
import { formatMoney } from "@/lib/formatting/format";
import { StatusBadge } from "@/components/auction/StatusBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SellerLotRowProps {
    auction: IAuction;
    isCancelling: boolean;
    onEdit: (id: string) => void;
    onCancelRequest: (auction: IAuction) => void;
}

export function SellerLotRow({
    auction,
    isCancelling,
    onEdit,
    onCancelRequest,
}: SellerLotRowProps) {
    const isUpcoming = auction.status === "upcoming";
    const isActive = auction.status === "active";
    const canEdit = isUpcoming;
    const canCancel = isUpcoming || isActive;

    return (
        <li className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-b-0 md:flex-nowrap">
            {/* ── Identity: Thumb + Meta ── */}
            <Link
                href={`/auctions/${auction._id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
            >
                <div className="h-14 w-14 shrink-0 overflow-hidden border border-border bg-secondary">
                    {auction.images?.[0] ? (
                        <img src={auction.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full" aria-hidden />
                    )}
                </div>

                <div className="min-w-0">
                    <h3 className="truncate font-serif text-base text-foreground transition-colors hover:text-primary">
                        {auction.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {auction.category} · {formatMoney(auction.startingPrice ?? 0)} start
                    </p>
                </div>
            </Link>

            {/* ── Status & Time ── */}
            <div className="flex w-full items-center justify-between gap-4 md:w-auto md:flex-col md:items-end md:gap-1">
                <StatusBadge status={auction.status} dot={isActive} />
                {isActive ? (
                    <CountdownTimer endTime={auction.endTime} className="text-xs" />
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {isUpcoming ? "Starts soon" : "Closed"}
                    </span>
                )}
            </div>

            {/* ── Current Bid (The number that matters) ── */}
            <div className="hidden w-24 shrink-0 text-right md:block">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Current</p>
                <p className="text-sm font-medium tabular-nums text-primary">
                    {formatMoney(auction.currentBid ?? auction.startingPrice ?? 0)}
                </p>
            </div>

            {/* ── Actions ── */}
            <div className="flex shrink-0 items-center gap-2">
                <Button variant="ghost" size="icon" asChild aria-label="View lot">
                    <Link href={`/auctions/${auction._id}`}>
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(auction._id)}
                    disabled={!canEdit}
                    aria-label="Edit lot"
                    className={cn(!canEdit && "opacity-30 cursor-not-allowed")}
                >
                    <Edit className="h-4 w-4" strokeWidth={1.5} />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCancelRequest(auction)}
                    disabled={!canCancel || isCancelling}
                    loading={isCancelling}
                    aria-label="Cancel lot"
                    className={cn(
                        "text-muted-foreground hover:text-destructive",
                        !canCancel && "opacity-30 cursor-not-allowed hover:text-muted-foreground"
                    )}
                >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </div>
        </li>
    );
}