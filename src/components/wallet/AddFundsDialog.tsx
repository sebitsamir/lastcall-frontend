// src/components/wallet/AddFundsDialog.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * ADD FUNDS DIALOG
 * Deposit flow with quick-amount chips. Optimistic-free by design: money
 * moves only after the server confirms, then the parent refreshes balances.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { walletApi } from "@/lib/api/wallet";
import { formatMoney } from "@/lib/formatting/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Sensible presets keep the flow one-tap for common amounts. */
const QUICK_AMOUNTS = [500, 1000, 5000];

interface AddFundsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Parent refreshes user + ledger after a successful deposit. */
    onSuccess: () => void;
}

export function AddFundsDialog({ open, onOpenChange, onSuccess }: AddFundsDialogProps) {
    const [amount, setAmount] = useState("1000");
    const [submitting, setSubmitting] = useState(false);

    // Reset transient state each time the dialog opens — no stale errors.
    useEffect(() => {
        if (open) {
            setAmount("1000");
            setSubmitting(false);
        }
    }, [open]);

    // Escape closes, matching ConfirmDialog's interaction grammar.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onOpenChange]);

    const parsed = Number(amount);
    const valid = Number.isFinite(parsed) && parsed > 0;

    const submit = async () => {
        if (!valid || submitting) return;
        setSubmitting(true);
        try {
            await walletApi.deposit(parsed);
            toast.success(`${formatMoney(parsed)} added to your available balance`);
            onOpenChange(false);
            onSuccess(); // refresh balances + ledger
        } catch {
            toast.error("Deposit failed. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => onOpenChange(false)} aria-hidden />

            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Add funds"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                className="relative w-full max-w-sm space-y-5 border border-border bg-popover p-6"
            >
                <div className="space-y-1">
                    <h2 className="font-serif text-xl text-foreground">Add Funds</h2>
                    <p className="text-sm text-muted-foreground">
                        Funds land in your available balance instantly.
                    </p>
                </div>

                {/* Quick amounts: one tap beats typing */}
                <div className="flex gap-2">
                    {QUICK_AMOUNTS.map((q) => (
                        <button
                            key={q}
                            onClick={() => setAmount(String(q))}
                            className={cn(
                                "flex-1 border px-2 py-1.5 text-xs tabular-nums transition-colors",
                                Number(amount) === q
                                    ? "border-primary text-primary"
                                    : "border-border text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {formatMoney(q)}
                        </button>
                    ))}
                </div>

                <Input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    aria-label="Deposit amount"
                />

                <div className="flex gap-3">
                    <Button className="flex-1" loading={submitting} disabled={!valid} onClick={submit}>
                        Add Funds
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}