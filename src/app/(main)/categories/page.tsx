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
        <div className="mx-auto w-full max-w-[1200px] space-y-8 px-[clamp(16px,3vw,32px)] py-7">
            <SectionHeading
                overline="Browse the house"
                title="Categories"
                description="Open a department to see lots on the floor."
            />

            <CategoryIndex />
        </div>
    );
}
