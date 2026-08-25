// src/components/bidding/BidPanel.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * BID PANEL
 * The trust surface of the marketplace. Responsibilities:
 *   1. Pre-validate against client mirrors (min bid, available balance).
 *   2. Gate every bid behind an explicit confirmation (funds get reserved).
 *   3. Translate backend rejections into designed recovery states.
 * Money authority always stays with the server.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import type { IAuction } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { bidsApi } from "@/lib/api/bids";
import { classifyBidError, type BidFailure } from "@/lib/bidding/errors";
import { availableBalance, minimumNextBid } from "@/lib/bidding/rules";
import { formatMoney } from "@/lib/formatting/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";

interface BidPanelProps {
    auction: IAuction;
    /** Called after a successful bid so the page can morph state + history. */
    onBidPlaced: (amount: number) => void;
}

export function BidPanel({ auction, onBidPlaced }: BidPanelProps) {
    const { isAuthenticated, user, initializeAuth } = useAuthStore();

    /* ── Derived money facts ─────────────────────────────────────────────── */
    const minNext = minimumNextBid(auction);
    const balance = availableBalance(user);

    /* ── Local form state ────────────────────────────────────────────────── */
    const [value, setValue] = useState<string>(String(minNext));
    const [touched, setTouched] = useState(false);      // user edited the input
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [failure, setFailure] = useState<BidFailure | null>(null);

    /**
     * When someone else raises the bid, the suggested input must follow —
     * unless the user is mid-typing (touched). Stale suggestions cause
     * "bid too low" frustration.
     */
    useEffect(() => {
        if (!touched) setValue(String(minNext));
    }, [minNext, touched]);

    const parsed = Number(value);
    const valid = Number.isFinite(parsed) && parsed >= minNext;
    const afterBid = balance - parsed; // what stays liquid if this bid leads

    /* ── Guests can admire, not bid ──────────────────────────────────────── */
    if (!isAuthenticated) {
        return (
            <div className="space-y-3 border border-border bg-card p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Sign in to place bids on this lot.
                </p>
                <Button className="w-full" asChild>
                    <Link href="/login">Sign In to Bid</Link>
                </Button>
            </div>
        );
    }

    /* ── Submit pipeline ─────────────────────────────────────────────────── */
    const requestConfirm = () => {
        setFailure(null);

        // Client mirrors: fast, friendly, non-authoritative.
        if (!valid) {
            setFailure({ kind: "tooLow", message: "" });
            return;
        }
        if (parsed > balance) {
            setFailure({ kind: "insufficientFunds", message: "" });
            return;
        }
        setConfirmOpen(true); // Real requests only after explicit consent.
    };

    const placeBid = async () => {
        setSubmitting(true);
        try {
            await bidsApi.place(auction._id, parsed);

            // Success: propagate upward, refresh wallet (funds now reserved).
            setConfirmOpen(false);
            setTouched(false);
            onBidPlaced(parsed);
            toast.success(`You're the highest bidder at ${formatMoney(parsed)}`);
            void initializeAuth(); // refetch /users/me for fresh balances
        } catch (error) {
            setConfirmOpen(false);
            setFailure(classifyBidError(error)); // designed recovery states
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className="space-y-4 border border-border bg-card p-5">
            {/* Minimum next bid: the rule, stated plainly */}
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                <span className="uppercase tracking-[0.15em]">Minimum next bid</span>
                <span className="tabular-nums text-foreground">{formatMoney(minNext)}</span>
            </div>

            <div className="flex gap-2">
                <Input
                    type="number"
                    inputMode="numeric"
                    min={minNext}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setTouched(true);
                        setFailure(null); // editing is a recovery action itself
                    }}
                    aria-label="Your bid amount"
                />
                <Button onClick={requestConfirm} className="shrink-0">
                    Place Bid
                </Button>
            </div>

            {/* Escrow transparency: liquid now vs liquid if you lead */}
            <div className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between">
                    <span>Available balance</span>
                    <span className="tabular-nums text-foreground">{formatMoney(balance)}</span>
                </div>
                <div className="flex justify-between">
                    <span>After bid</span>
                    <span className={afterBid < 0 ? "tabular-nums text-destructive" : "tabular-nums"}>
                        {formatMoney(afterBid)} available
                    </span>
                </div>
                <p className="pt-1 text-[10px] leading-relaxed text-muted-foreground/70">
                    Funds are reserved only while you are the highest bidder.
                </p>
            </div>

            {/* ── Designed failure states with recovery actions ── */}
            {failure?.kind === "tooLow" && (
                <FailureNote
                    title="Bid too low"
                    body={`The current bid is ${formatMoney(auction.currentBid ?? 0)}. Your bid must be at least ${formatMoney(minNext)}.`}
                    actionLabel="Update bid"
                    onAction={() => {
                        setValue(String(minNext));
                        setTouched(false);
                        setFailure(null);
                    }}
                />
            )}

            {failure?.kind === "insufficientFunds" && (
                <FailureNote
                    title="Insufficient funds"
                    body={`You have ${formatMoney(balance)} available. This bid requires ${formatMoney(parsed || minNext)}.`}
                    actionLabel="Add funds"
                    onAction={() => undefined}
                    actionHref="/account/wallet"
                />
            )}

            {failure?.kind === "seller" && (
                <FailureNote
                    title="Sellers can't bid"
                    body="You listed this lot. Bidding on your own auction is not permitted."
                />
            )}

            {failure?.kind === "closed" && (
                <FailureNote
                    title="Auction closed"
                    body="This lot is no longer accepting bids."
                />
            )}

            {failure?.kind === "unknown" && (
                <FailureNote title="Bid not placed" body={failure.message} />
            )}

            {/* ── Confirmation gate: consent before reserving money ── */}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirm your bid"
                description={
                    <>
                        <span className="font-serif text-2xl text-primary tabular-nums">
                            {formatMoney(parsed || 0)}
                        </span>
                        <p className="mt-2">
                            Your funds will be temporarily reserved while you are the highest
                            bidder.
                        </p>
                    </>
                }
                confirmLabel="Confirm Bid"
                loading={submitting}
                onConfirm={placeBid}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}

/** Small internal primitive for failure notes; optional link-style action. */
function FailureNote({
    title,
    body,
    actionLabel,
    onAction,
    actionHref,
}: {
    title: string;
    body: string;
    actionLabel?: string;
    onAction?: () => void;
    actionHref?: string;
}) {
    return (
        <div className="space-y-2 border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-destructive">
                {title}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            {actionLabel &&
                (actionHref ? (
                    <Link
                        href={actionHref}
                        className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                        {actionLabel}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                        {actionLabel}
                    </button>
                ))}
        </div>
    );
}