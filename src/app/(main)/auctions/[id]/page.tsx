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
import { ArrowLeft, BadgeCheck, Lock, Zap } from "lucide-react";
import { toast } from "sonner";

import type { IAuction } from "@/types";
import { auctionsApi } from "@/lib/api/auctions";
import { bidsApi, type BidRecord } from "@/lib/api/bids";
import { subscribeToAuction } from "@/lib/socket/auctionSocket";
import type { NewBidPayload, OutbidPayload, AuctionEndedPayload, AuctionStartedPayload } from "@/lib/socket/events";
import { displayStatus } from "@/lib/auction/status";
import { formatMoney, lotNumber } from "@/lib/formatting/format";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/auction/StatusBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { AuctionGallery } from "@/components/auction/AuctionGallery";
import { AuctionProgress } from "@/components/auction/AuctionProgress";
import { TrustItem } from "@/components/ui/trust-item";
import { BidHistory } from "@/components/auction/BidHistory";
import { SellerCard } from "@/components/auction/SellerCard";
import { AuctionStateNotice } from "@/components/auction/AuctionStateNotice";
import { BidPanel } from "@/components/bidding/BidPanel";
import { MorphingMoney } from "@/components/bidding/MorphingMoney";
import { WatchlistButton } from "@/components/auction/WatchlistButton";


import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MobileBidBar } from "@/components/bidding/MobileBidBar";
import { useNow } from "@/hooks/useNow";

type LotTab = "overview" | "details" | "seller";

const LOT_TABS: { id: LotTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "details", label: "Details" },
    { id: "seller", label: "Seller" },
];

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionId = params.id as string;

    const { user } = useAuthStore();
    const bidPanelRef = useRef<HTMLDivElement>(null);
    const now = useNow(1_000);

    /* ── Server state ─────────────────────────────────────────────────────── */
    const [auction, setAuction] = useState<IAuction | null>(null);
    const [bids, setBids] = useState<BidRecord[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error" | "notFound">("loading");
    const [outbid, setOutbid] = useState<OutbidPayload | null>(null);
    const [tab, setTab] = useState<LotTab>("overview");

    const requestId = useRef(0); // stale-response guard for the initial fetch

    // Dynamic browser tab title
    usePageTitle(auction ? `${auction.title} — LastCall` : "Auction — LastCall");

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
                const mine = payload.bidderId === ((user as { _id?: string } | null)?._id ?? "");
                if (!mine) toast.info(`${payload.bidderName} bid ${formatMoney(payload.currentBid)}`);

                // A new bid supersedes any earlier outbid notice.
                setOutbid(null);
            },
            onOutbid: (payload: OutbidPayload) => {
                // Personal surface: you lost the lead; escrow released your funds.
                if (payload.previousBidderId === ((user as { _id?: string } | null)?._id ?? "")) {
                    setOutbid(payload);
                }
            },
            onAuctionEnded: (payload: AuctionEndedPayload) => {
                setAuction((prev) =>
                    prev
                        ? { ...prev, status: (payload.status as IAuction["status"]) || "completed" }
                        : prev
                );
            },
            onAuctionStarted: (payload: AuctionStartedPayload) => {
                if (payload.auctionId !== auctionId) return;
                setAuction((prev) =>
                    prev ? { ...prev, status: "active" } : prev
                );
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

    const resolvedStatus = displayStatus(auction, now);
    const isActive = resolvedStatus === "active";
    const currentUserId = (user as { _id?: string } | null)?._id;

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        // Page transition wrapper + extra bottom padding for mobile bars
        <PageTransition>
            <div className="mx-auto w-full max-w-[1200px] px-[clamp(16px,3vw,32px)] pb-[calc(11rem+env(safe-area-inset-bottom,0px))] pt-5 sm:pt-7 md:pb-8">
                {/* Quiet breadcrumb back to the floor */}
                <Link
                    href="/auctions"
                    className="inline-flex h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                    Back to auctions
                </Link>

                <div className="mt-3 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-10">
                    {/* ══ LEFT: gallery ══ */}
                    <div className="min-w-0 lg:sticky lg:top-24">
                        <AuctionGallery
                            images={auction.images ?? []}
                            title={auction.title}
                            overlay={
                                <WatchlistButton
                                    auctionId={auction._id}
                                    initialIsWatching={false}
                                    className="absolute right-4 top-4 z-10 h-11 w-11"
                                />
                            }
                        />
                    </div>

                    {/* ══ RIGHT: identity + the live bidding engine ══ */}
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                status={auction.status}
                                startTime={auction.startTime}
                                endTime={auction.endTime}
                                dot={isActive}
                            />
                            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-secondary px-[11px] text-xs font-semibold text-muted-foreground">
                                <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
                                Verified seller
                            </span>
                        </div>

                        <h1 className="mb-1.5 mt-3 break-words text-[clamp(24px,4vw,40px)] tracking-[-0.02em]">
                            {auction.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lot {lotNumber(auction._id)} · {auction.category}
                        </p>

                        {/* Price, time, progress and the bid controls share one card */}
                        <div className="mt-5 grid gap-4 rounded-panel border border-border bg-card p-4 sm:gap-[18px] sm:p-[clamp(18px,2.5vw,28px)]">
                            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                                <div className="min-w-0">
                                    <span className="block text-xs font-medium text-muted-foreground">Current bid</span>
                                    <MorphingMoney
                                        value={auction.currentBid ?? auction.startingPrice ?? 0}
                                        className="text-[clamp(30px,7vw,48px)] font-[650] leading-none tracking-[-0.02em] text-primary-text"
                                    />
                                    <span className="mt-1 block text-sm tabular-nums text-muted-foreground">
                                        {bids.length} {bids.length === 1 ? "bid" : "bids"}
                                    </span>
                                </div>
                                <div className="sm:text-right">
                                    <span className="block text-xs font-medium text-muted-foreground">
                                        {isActive ? "Ends in" : "Status"}
                                    </span>
                                    <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} icon className="text-lg sm:text-xl" />
                                </div>
                            </div>

                            {isActive && (
                                <AuctionProgress
                                    startTime={(auction as Record<string, unknown>).startTime as string | undefined}
                                    endTime={auction.endTime}
                                />
                            )}

                            {/* Personal outbid surface — escrow made visible */}
                            {outbid && (
                                <div className="space-y-2 rounded-field border border-destructive/40 bg-destructive/10 p-4">
                                    <p className="text-[13px] font-semibold text-destructive">
                                        You&apos;ve been outbid
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
                                <div ref={bidPanelRef}>
                                    <BidPanel auction={auction} onBidPlaced={handleBidPlaced} />
                                </div>
                            ) : (
                                <AuctionStateNotice
                                    status={resolvedStatus}
                                    currentBid={auction.currentBid}
                                    startTime={(auction as Record<string, unknown>).startTime as string | undefined}
                                />
                            )}
                        </div>

                    </div>
                </div>

                {/* Trust strip */}
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <TrustItem icon={Lock} title="Escrowed bids" copy="Funds reserved only while you lead" />
                    <TrustItem icon={Zap} title="Live bidding" copy="Updates the moment a bid lands" />
                    <TrustItem icon={BadgeCheck} title="Verified sellers" copy="Authenticated & verified" />
                </div>

                <div className="mt-10 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    {/* Lot dossier: real fields only, split across tabs */}
                    <section className="min-w-0 rounded-panel border border-border bg-card p-4 sm:p-[clamp(18px,2.5vw,28px)]">
                        <div
                            role="tablist"
                            aria-label="Lot information"
                            className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-secondary p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {LOT_TABS.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === t.id}
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "h-[38px] whitespace-nowrap rounded-full px-[18px] text-sm font-medium transition-colors",
                                        tab === t.id
                                            ? "bg-card text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div role="tabpanel" className="mt-5">
                            {tab === "overview" && (
                                <>
                                    <p className="mb-[18px] max-w-[640px] leading-relaxed text-muted-foreground">
                                        {auction.description}
                                    </p>
                                    <div className="grid sm:grid-cols-2 sm:gap-x-8">
                                        <MetaCell label="Lot" value={lotNumber(auction._id)} />
                                        <MetaCell label="Category" value={auction.category} />
                                        <MetaCell label="Starting price" value={formatMoney(auction.startingPrice ?? 0)} />
                                        <MetaCell label="Ends" value={new Date(auction.endTime).toLocaleString()} />
                                    </div>
                                </>
                            )}

                            {tab === "details" && (
                                <div className="grid sm:grid-cols-2 sm:gap-x-8">
                                    <MetaCell label="Lot number" value={lotNumber(auction._id)} />
                                    <MetaCell label="Status" value={auction.status.charAt(0).toUpperCase() + auction.status.slice(1)} />
                                    <MetaCell label="Starting price" value={formatMoney(auction.startingPrice ?? 0)} />
                                    <MetaCell label="Current bid" value={formatMoney(auction.currentBid ?? auction.startingPrice ?? 0)} />
                                    <MetaCell label="Total bids" value={String(bids.length)} />
                                    <MetaCell
                                        label="Starts"
                                        value={
                                            (auction as Record<string, unknown>).startTime
                                                ? new Date((auction as Record<string, unknown>).startTime as string).toLocaleString()
                                                : "—"
                                        }
                                    />
                                    <MetaCell label="Ends" value={new Date(auction.endTime).toLocaleString()} />
                                </div>
                            )}

                            {tab === "seller" && (
                                <SellerCard
                                    name={
                                        typeof auction.seller === "object" && auction.seller
                                            ? (auction.seller as { name?: string }).name
                                            : undefined
                                    }
                                />
                            )}
                        </div>
                    </section>

                    {/* Bid activity timeline */}
                    <section className="min-w-0 rounded-panel border border-border bg-card p-4 sm:p-[clamp(18px,2.5vw,28px)]">
                        <h3 className="mb-4 text-lg">Bid history</h3>
                        <BidHistory bids={bids} currentUserId={currentUserId} />
                    </section>
                </div>

                {/* Sticky mobile bid bar (hidden on desktop) */}
                <MobileBidBar
                    currentBid={auction.currentBid ?? auction.startingPrice ?? 0}
                    visible={isActive}
                    onBidClick={() =>
                        bidPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }
                />
            </div>
        </PageTransition>
    );
}

/* ── Internal helpers ────────────────────────────────────────────────────── */

/** One key-fact row: muted label left, value right. */
function MetaCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-3 border-b border-border py-3.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right tabular-nums">{value}</span>
        </div>
    );
}


/** Mirrors the split-screen geometry so loading never shifts layout. */
function DetailSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1200px] px-[clamp(16px,3vw,32px)] pt-7">
            <Skeleton className="mb-4 h-5 w-32" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-10">
                <Skeleton className="aspect-square w-full rounded-hero" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-72 w-full rounded-panel" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    );
}
