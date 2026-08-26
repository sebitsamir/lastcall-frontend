// src/app/error.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * GLOBAL ERROR BOUNDARY (must be a client component)
 * Catches any uncaught render/runtime error below the root layout.
 * Reassures about money first — trust is the product.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Log for you, not for the user (add Sentry here later if desired).
    console.error("[LastCall] Uncaught error:", error);

    return (
        <div className="mx-auto max-w-3xl px-4 py-24">
            <ErrorState
                title="The house hit a snag"
                description="Something unexpected interrupted the experience. Your funds and bids are safe."
                action={
                    <Button size="sm" onClick={() => reset()}>
                        Try again
                    </Button>
                }
            />
        </div>
    );
}