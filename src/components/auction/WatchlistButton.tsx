// src/components/auction/WatchlistButton.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WATCHLIST BUTTON (upgraded)
 * Same public interface (auctionId, initialIsWatching) so every existing
 * usage keeps working. Now with: optimistic toggle + rollback, tap-scale
 * spring, and a heart "pop" on state change. Motion = state, not decor.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/errors";

import { watchlistApi } from "@/lib/api/watchlist";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
    auctionId: string;
    initialIsWatching?: boolean;
    className?: string;
}

export function WatchlistButton({
    auctionId,
    initialIsWatching = false,
    className,
}: WatchlistButtonProps) {
    const [watching, setWatching] = useState(initialIsWatching);
    const [busy, setBusy] = useState(false);

    const toggle = async (e: React.MouseEvent) => {
        // The button may live inside a card <Link> — don't navigate on tap.
        e.preventDefault();
        e.stopPropagation();
        if (busy) return;

        setBusy(true);
        const next = !watching;
        setWatching(next); // optimistic — the heart reacts instantly

        try {
            await watchlistApi.toggle(auctionId);
            toast.success(next ? "Added to watchlist" : "Removed from watchlist");
        } catch (error) {
            setWatching(!next); // rollback — the UI never lies
            toast.error(getApiErrorMessage(error, "Couldn't update your watchlist"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.88 }} // tactile press feedback
            onClick={toggle}
            disabled={busy}
            aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
            aria-pressed={watching}
            className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-card transition-colors",
                watching ? "text-destructive" : "text-muted-foreground hover:text-foreground",
                className
            )}
        >
            {/* Keyed by state so the heart "pops" on every toggle */}
            <motion.span
                key={String(watching)}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
                <Heart className={cn("h-5 w-5", watching && "fill-current")} strokeWidth={1.7} />
            </motion.span>
        </motion.button>
    );
}
