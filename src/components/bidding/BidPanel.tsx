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

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";

/** Quick-raise steps offered above the current bid (design `.q` chips). */
const QUICK_RAISES = [100, 500, 1000] as const;

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
            <div className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Sign in to place bids on this lot.
                </p>
                <Button size="lg" className="w-full" asChild>
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
    const currentBid = auction.currentBid ?? auction.startingPrice ?? 0;

    const pick = (amount: number, followMinimum: boolean) => {
        setValue(String(amount));
        setTouched(!followMinimum); // "Min" re-attaches the field to live updates
        setFailure(null);
    };

    return (
        <div className="grid gap-[18px]">
            {/* The bid field: one big, thumb-friendly number */}
            <label
                className="flex h-14 items-center gap-2 rounded-field border border-border bg-secondary px-[18px] transition-[border-color,box-shadow] focus-within:border-primary-text focus-within:ring-4 focus-within:ring-primary/12"
            >
                <span className="text-xl text-muted-foreground">$</span>
                <input
                    type="number"
                    inputMode="numeric"
                    min={minNext}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setTouched(true);
                        setFailure(null); // editing is a recovery action itself
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") requestConfirm();
                    }}
                    aria-label="Your bid amount"
                    className="min-w-0 flex-1 appearance-none border-0 bg-transparent text-[22px] font-semibold tabular-nums text-foreground outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                    Min {formatMoney(minNext)}
                </span>
            </label>

            {/* Quick bids: Min, then fixed raises over the current bid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                    type="button"
                    onClick={() => pick(minNext, true)}
                    className="h-11 rounded-xl border border-border bg-secondary text-sm font-semibold transition-colors hover:border-primary-text hover:text-primary-text"
                >
                    Min
                </button>
                {QUICK_RAISES.map((raise) => (
                    <button
                        key={raise}
                        type="button"
                        onClick={() => pick(Math.max(minNext, currentBid + raise), false)}
                        className="h-11 rounded-xl border border-border bg-secondary text-sm font-semibold tabular-nums transition-colors hover:border-primary-text hover:text-primary-text max-[400px]:text-[13px]"
                    >
                        +{formatMoney(raise)}
                    </button>
                ))}
            </div>

            <Button size="lg" onClick={requestConfirm} className="w-full">
                Place Bid
            </Button>

            {/* Escrow transparency: liquid now vs liquid if you lead */}
            <div className="space-y-1 text-[13px] text-muted-foreground">
                <div className="flex justify-between">
                    <span>Available balance</span>
                    <span className="tabular-nums text-foreground">{formatMoney(balance)}</span>
                </div>
                <div className="flex justify-between">
                    <span>After bid</span>
                    <span className={cn("tabular-nums", afterBid < 0 && "text-destructive")}>
                        {formatMoney(afterBid)} available
                    </span>
                </div>
                <p className="pt-1 text-xs leading-relaxed">
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
                        <span className="text-2xl font-[650] text-primary-text tabular-nums">
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
        <div className="space-y-2 rounded-field border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-[13px] font-semibold text-destructive">
                {title}
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            {actionLabel &&
                (actionHref ? (
                    <Link
                        href={actionHref}
                        className="inline-block text-[13px] font-semibold text-primary-text underline-offset-4 hover:underline"
                    >
                        {actionLabel}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="inline-block text-[13px] font-semibold text-primary-text underline-offset-4 hover:underline"
                    >
                        {actionLabel}
                    </button>
                ))}
        </div>
    );
}