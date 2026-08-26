// src/components/selling/CancelDialog.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * CANCEL DIALOG
 * Cancelling a lot isn't just a state change; it's a financial event.
 * If the lot is live and has bids, the backend automatically releases the
 * highest bidder's frozen funds. The UI must explain this transparently
 * so the seller understands the consequence of their action.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatting/format";

interface CancelDialogProps {
    open: boolean;
    lotTitle: string;
    currentBid?: number; // If > 0, we must warn about the refund
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CancelDialog({
    open,
    lotTitle,
    currentBid,
    loading = false,
    onConfirm,
    onCancel,
}: CancelDialogProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    // Focus trap + Escape key lifecycle
    useEffect(() => {
        if (!open) return;
        confirmRef.current?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    const hasBids = (currentBid ?? 0) > 0;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onCancel} aria-hidden />

            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Cancel auction"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                className="relative w-full max-w-md border border-border bg-popover p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-destructive/30 bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-serif text-xl text-foreground">Withdraw Lot</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Are you sure you want to cancel <span className="font-medium text-foreground">{lotTitle}</span>?
                        </p>

                        {/* The crucial trust mechanic: explain the escrow release */}
                        {hasBids && (
                            <div className="mt-3 border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                                <p className="font-medium text-foreground">Active bids detected.</p>
                                <p className="mt-1">
                                    The current highest bid of {formatMoney(currentBid!)} will be
                                    automatically released back to the bidder's available balance.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button
                        variant="destructive"
                        className="flex-1"
                        loading={loading}
                        onClick={onConfirm}
                    >
                        Withdraw Lot
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Keep Listed
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}