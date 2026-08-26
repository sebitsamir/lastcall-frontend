// src/app/(main)/categories/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * CATEGORIES PAGE
 * The dedicated browsing floor. Reuses the homepage's CategoryIndex so the
 * interaction grammar is identical everywhere; each cell deep-links into
 * the Auctions page via ?category= (which the filter rail already reads).
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryIndex } from "@/components/marketing/CategoryIndex";

export default function CategoriesPage() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-8">
            <SectionHeading
                overline="Browse the house"
                title="Categories"
                description="Every department of LastCall. Pick a floor to explore."
            />

            <CategoryIndex />
        </div>
    );
}