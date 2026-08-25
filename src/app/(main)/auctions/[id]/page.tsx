// src/app/(main)/auctions/[id]/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * AUCTION DETAIL — THE FLAGSHIP PAGE
 * Split-screen composition: editorial gallery left, live bidding engine
 * right (sticky). Real-time via the auction room subscription:
 *   newBid  → price morphs, history prepends, room is toasted
 *   outbid  → personal "you've been outbid" surface with released funds
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";

import type { IAuction } from "@/types";
import { auctionsApi } from "@/lib/api/auctions";
import { bidsApi, type BidRecord } from "@/lib/api/bids";
import { subscribeToAuction } from "@/lib/socket/auctionSocket";
import type { NewBidPayload, OutbidPayload } from "@/lib/socket/events";
import { formatMoney, lotNumber } from "@/lib/formatting/format";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/auction/StatusBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { AuctionGallery } from "@/components/auction/AuctionGallery";
import { BidHistory } from "@/components/auction/BidHistory";
import { SellerCard } from "@/components/auction/SellerCard";
import { AuctionStateNotice } from "@/components/auction/AuctionStateNotice";
import { BidPanel } from "@/components/bidding/BidPanel";
import { MorphingMoney } from "@/components/bidding/MorphingMoney";
import { WatchlistButton } from "@/components/auction/WatchlistButton";

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionId = params.id as string;

    const { user } = useAuthStore();

    /* ── Server state ─────────────────────────────────────────────────────── */
    const [auction, setAuction] = useState<IAuction | null>(null);
    const [bids, setBids] = useState<BidRecord[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error" | "notFound">("loading");
    const [outbid, setOutbid] = useState<OutbidPayload | null>(null);

    const requestId = useRef(0); // stale-response guard for the initial fetch

    /* ── Initial fetch ────────────────────────────────────────────────────── */
    const load = useCallback(() => {
        const id = ++requestId.current;
        setStatus("loading");

        auctionsApi
            .getById(auctionId)
            .then((data) => {
                if (id !== requestId.current) return;
                setAuction(data);
                // Seed history from the populated endpoint, tolerating absence.
                setBids(Array.isArray((data as Record<string, unknown>).bids)
                    ? ((data as Record<string, unknown>).bids as BidRecord[])
                    : []);
                setStatus("ready");
            })
            .catch((err) => {
                if (id !== requestId.current) return;
                setStatus(err?.response?.status === 404 ? "notFound" : "error");
            });
    }, [auctionId]);

    useEffect(() => {
        load();
    }, [load]);

    /* ── Real-time room subscription ─────────────────────────────────────── */
    useEffect(() => {
        if (status !== "ready" || !auction) return;

        const unsubscribe = subscribeToAuction({
            auctionId,
            onNewBid: (payload: NewBidPayload) => {
                // 1. Morph the price + counters.
                setAuction((prev) =>
                    prev ? { ...prev, currentBid: payload.currentBid } : prev
                );

                // 2. Prepend an optimistic live record; reconciled on next fetch.
                setBids((prev) => [
                    {
                        _id: `live-${payload.currentBid}-${Date.now()}`,
                        amount: payload.currentBid,
                        bidder: { name: payload.bidderName },
                        createdAt: new Date().toISOString(),
                    },
                    ...prev,
                ]);

                // 3. Room awareness — but never toast the user's own bid twice.
                const mine = payload.bidderName === "You";
                if (!mine) toast.info(`${payload.bidderName} bid ${formatMoney(payload.currentBid)}`);

                // A new bid supersedes any earlier outbid notice.
                setOutbid(null);
            },
            onOutbid: (payload: OutbidPayload) => {
                // Personal surface: you lost the lead; escrow released your funds.
                setOutbid(payload);
            },
        });

        return unsubscribe; // leave the room + remove listeners on unmount
    }, [status, auctionId, auction?._id]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Successful bid propagation from the panel ───────────────────────── */
    const handleBidPlaced = (amount: number) => {
        setOutbid(null);
        setAuction((prev) => (prev ? { ...prev, currentBid: amount } : prev));
        setBids((prev) => [
            {
                _id: `mine-${amount}-${Date.now()}`,
                amount,
                bidder: { _id: (user as { _id?: string } | null)?._id, name: "You" },
                createdAt: new Date().toISOString(),
            },
            ...prev,
        ]);
    };

    /* ── Terminal states ─────────────────────────────────────────────────── */
    if (status === "loading") return <DetailSkeleton />;

    if (status === "error") {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20">
                <ErrorState
                    title="Couldn't load this lot"
                    description="The auction data didn't arrive. Check your connection and try again."
                    action={<Button variant="outline" size="sm" onClick={load}>Retry</Button>}
                />
            </div>
        );
    }

    if (status === "notFound" || !auction) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20">
                <EmptyState
                    title="Lot not found"
                    description="This auction may have been removed or never existed."
                    action={<Button variant="outline" size="sm" asChild><Link href="/auctions">Browse Auctions</Link></Button>}
                />
            </div>
        );
    }

    const isActive = auction.status === "active";

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
            {/* Quiet breadcrumb back to the floor */}
            <Link
                href="/auctions"
                className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                Auctions
            </Link>

            <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
                {/* ══ LEFT: editorial gallery + lot dossier ══ */}
                <div className="min-w-0 space-y-10">
                    <AuctionGallery images={auction.images ?? []} title={auction.title} />

                    {/* About the lot */}
                    <section className="space-y-3">
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            About the Lot
                        </h2>
                        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
                            {auction.description}
                        </p>
                    </section>

                    {/* Lot metadata: hairline table, not cards */}
                    <section className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
                        <MetaCell label="Lot" value={lotNumber(auction._id)} />
                        <MetaCell label="Category" value={auction.category} />
                        <MetaCell label="Starting Price" value={formatMoney(auction.startingPrice ?? 0)} />
                        <MetaCell
                            label="Ends"
                            value={new Date(auction.endTime).toLocaleString()}
                        />
                    </section>

                    {/* Bid activity timeline */}
                    <section className="space-y-4">
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Bid Activity
                        </h2>
                        <BidHistory
                            bids={bids}
                            currentUserId={(user as { _id?: string } | null)?._id}
                        />
                    </section>
                </div>

                {/* ══ RIGHT: the live bidding engine (sticky) ══ */}
                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                    {/* Identity row */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <StatusBadge status={auction.status} dot={isActive} />
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Lot {lotNumber(auction._id)} · {auction.category}
                            </p>
                        </div>
                        <WatchlistButton auctionId={auction._id} initialIsWatching={false} />
                    </div>

                    <h1 className="font-serif text-3xl leading-tight text-foreground">
                        {auction.title}
                    </h1>

                    {/* The two numbers that matter: value + time */}
                    <div className="flex items-end justify-between border-y border-border py-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Current Bid
                            </p>
                            <MorphingMoney
                                value={auction.currentBid ?? auction.startingPrice ?? 0}
                                className="text-4xl font-medium text-primary"
                            />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {isActive ? "Ends In" : "Status"}
                            </p>
                            <CountdownTimer endTime={auction.endTime} className="text-xl" />
                            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                                {bids.length} bids
                            </p>
                        </div>
                    </div>

                    {/* Personal outbid surface — escrow made visible */}
                    {outbid && (
                        <div className="space-y-2 border border-destructive/40 bg-destructive/10 p-4">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-destructive">
                                You've been outbid
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                The current bid is now {formatMoney(outbid.currentBid)}.
                                {typeof outbid.releasedAmount === "number" && (
                                    <> Your reserved {formatMoney(outbid.releasedAmount)} has been released.</>
                                )}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setOutbid(null)} // panel below is pre-set to min next
                            >
                                Bid Again
                            </Button>
                        </div>
                    )}

                    {/* Bidding engine vs terminal states */}
                    {isActive ? (
                        <BidPanel auction={auction} onBidPlaced={handleBidPlaced} />
                    ) : (
                        <AuctionStateNotice
                            status={auction.status}
                            currentBid={auction.currentBid}
                            startTime={(auction as Record<string, unknown>).startTime as string | undefined}
                        />
                    )}

                    {/* Trust surface */}
                    <SellerCard
                        name={
                            typeof auction.seller === "object" && auction.seller
                                ? (auction.seller as { name?: string }).name
                                : undefined
                        }
                    />
                </aside>
            </div>
        </div>
    );
}

/* ── Internal helpers ────────────────────────────────────────────────────── */

/** One cell of the hairline metadata table. */
function MetaCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1 bg-background p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className="text-sm text-foreground tabular-nums">{value}</p>
        </div>
    );
}

/** Mirrors the split-screen geometry so loading never shifts layout. */
function DetailSkeleton() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
            <Skeleton className="mb-8 h-4 w-24" />
            <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
                <div className="space-y-10">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-9 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    );
}