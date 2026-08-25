/**
 * CONFIRM DIALOG
 * Spring-entering modal with zero extra dependencies (no radix-dialog yet).
 * Accessibility basics are non-negotiable: focus on open, Escape to cancel,
 * overlay click cancels, aria-modal announced.
 */
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    /**
     * Focus + Escape lifecycle, bound only while open.
     * Cleanup removes the listener — no leaked global handlers.
     */
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

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Solid dim overlay — no glassmorphism */}
            <div className="absolute inset-0 bg-black/70" onClick={onCancel} aria-hidden />

            {/* Spring entrance: motion communicates state change, not decoration */}
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                className="relative w-full max-w-sm border border-border bg-popover p-6"
            >
                <h2 className="font-serif text-xl text-foreground">{title}</h2>

                {description && (
                    <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <Button
                        ref={confirmRef}
                        className="flex-1"
                        loading={loading}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}