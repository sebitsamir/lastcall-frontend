// src/app/(main)/account/bids/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * ACTIVE BIDS PAGE
 * Thin route wrapper over the shared ActiveBids surface — the dashboard
 * embeds the same component, so behavior can never drift between pages.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { ActiveBids } from "@/components/account/ActiveBids";

export default function BidsPage() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-8">
            <SectionHeading
                overline="Open positions"
                title="Active Bids"
                description="Every lot you're currently in, and where you stand."
            />
            <ActiveBids />
        </div>
    );
}