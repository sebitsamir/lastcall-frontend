// src/app/(main)/account/selling/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * SELLING MANAGEMENT PAGE
 * The seller's inventory dashboard. 
 * 
 * Sorting rule: Active/Upcoming lots lead (sorted by urgency/start time),
 * while Completed/Cancelled lots sink to the bottom (sorted by recency).
 * Cancellation is pessimistic (requires server confirmation) because it
 * triggers financial side-effects (escrow refunds).
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";

import type { IAuction } from "@/types";
import { auctionsApi } from "@/lib/api/auctions";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SellerLotRow } from "@/components/selling/SellerLotRow";
import { CancelDialog } from "@/components/selling/CancelDialog";

/** Sorts lots: Active/Upcoming first (by time), then Ended/Cancelled. */
function sortSellerLots(lots: IAuction[]): IAuction[] {
    return [...lots].sort((a, b) => {
        const stateWeight = (s: string) => (s === "active" || s === "upcoming" ? 0 : 1);
        const wA = stateWeight(a.status);
        const wB = stateWeight(b.status);

        if (wA !== wB) return wA - wB;

        // Within the same weight, sort by time.
        const tA = new Date(a.endTime || a.startTime || 0).getTime();
        const tB = new Date(b.endTime || b.startTime || 0).getTime();

        // Active/Upcoming: soonest first. Ended: most recent first.
        return wA === 0 ? tA - tB : tB - tA;
    });
}

export default function SellingPage() {
    const router = useRouter();

    const [lots, setLots] = useState<IAuction[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    // Track which lot is currently being cancelled to show a localized loading state
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [dialogTarget, setDialogTarget] = useState<IAuction | null>(null);

    const requestId = useRef(0); // Stale-response guard

    const load = useCallback(() => {
        const id = ++requestId.current;
        setStatus("loading");

        auctionsApi
            .mine()
            .then((data) => {
                if (id !== requestId.current) return;
                setLots(sortSellerLots(data));
                setStatus("ready");
            })
            .catch(() => {
                if (id !== requestId.current) return;
                setStatus("error");
            });
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    /* ── Actions ─────────────────────────────────────────────────────────── */
    const handleEdit = (id: string) => {
        router.push(`/auctions/create?edit=${id}`);
    };

    const handleCancelRequest = (auction: IAuction) => {
        setDialogTarget(auction);
    };

    const executeCancel = async () => {
        if (!dialogTarget) return;
        setCancellingId(dialogTarget._id);

        try {
            await auctionsApi.cancel(dialogTarget._id);
            toast.success("Lot withdrawn. Bidders have been refunded.");
            setDialogTarget(null);
            load(); // Refresh the list to reflect the new state
        } catch {
            toast.error("Couldn't withdraw the lot. Try again.");
        } finally {
            setCancellingId(null);
        }
    };

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 md:px-8">
            <SectionHeading
                overline="Your inventory"
                title="Selling"
                description="Manage your listings, edit upcoming lots, and track your sales."
                action={
                    <Button asChild>
                        <a href="/auctions/create">
                            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            List New Item
                        </a>
                    </Button>
                }
            />

            {status === "loading" && <SellingSkeleton />}

            {status === "error" && (
                <ErrorState
                    title="Couldn't load your inventory"
                    action={<Button variant="outline" size="sm" onClick={load}>Retry</Button>}
                />
            )}

            {status === "ready" && lots.length === 0 && (
                <EmptyState
                    icon={Package}
                    title="Your floor is empty"
                    description="You haven't listed any items for sale yet."
                    action={
                        <Button size="sm" asChild>
                            <a href="/auctions/create">List Your First Item</a>
                        </Button>
                    }
                />
            )}

            {status === "ready" && lots.length > 0 && (
                <div className="border border-border bg-card">
                    {/* Table Header (Desktop only) */}
                    <div className="hidden items-center gap-4 border-b border-border bg-secondary/30 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:flex">
                        <div className="flex-1">Lot</div>
                        <div className="w-24 text-right">Status</div>
                        <div className="w-24 text-right">Current Bid</div>
                        <div className="w-28 text-right">Actions</div>
                    </div>

                    <ol>
                        {lots.map((auction) => (
                            <SellerLotRow
                                key={auction._id}
                                auction={auction}
                                isCancelling={cancellingId === auction._id}
                                onEdit={handleEdit}
                                onCancelRequest={handleCancelRequest}
                            />
                        ))}
                    </ol>
                </div>
            )}

            <CancelDialog
                open={!!dialogTarget}
                lotTitle={dialogTarget?.title ?? ""}
                currentBid={dialogTarget?.currentBid}
                loading={!!cancellingId}
                onConfirm={executeCancel}
                onCancel={() => setDialogTarget(null)}
            />
        </div>
    );
}

/** Mirrors the row geometry for a seamless loading transition. */
function SellingSkeleton() {
    return (
        <div className="border border-border bg-card">
            <div className="hidden items-center gap-4 border-b border-border bg-secondary/30 px-4 py-2 md:flex">
                <div className="flex-1"><Skeleton className="h-3 w-12" /></div>
                <div className="w-24"><Skeleton className="ml-auto h-3 w-10" /></div>
                <div className="w-24"><Skeleton className="ml-auto h-3 w-12" /></div>
                <div className="w-28"><Skeleton className="ml-auto h-3 w-16" /></div>
            </div>
            {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
                    <Skeleton className="h-14 w-14" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                </div>
            ))}
        </div>
    );
}