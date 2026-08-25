/**
 * CATEGORY INDEX
 * Hairline-grid index of categories. Each cell deep-links into the Auctions
 * page using the `?category=` param that Chunk 3 already understands —
 * navigation and filtering share one contract.
 *
 * Technique: `gap-px` + `bg-border` produces 1px interior lines without
 * double borders — the editorial "table" look.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AUCTION_CATEGORIES } from "@/lib/api/auctions";

export function CategoryIndex() {
    return (
        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3">
            {AUCTION_CATEGORIES.map((category) => (
                <Link
                    key={category}
                    href={`/auctions?category=${encodeURIComponent(category)}`}
                    className="group flex items-center justify-between bg-background p-6 transition-colors hover:bg-card"
                >
                    <div>
                        {/* Serif name — categories are editorial, not metadata */}
                        <p className="font-serif text-lg text-foreground">{category}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                            View Lots
                        </p>
                    </div>

                    {/* Quiet affordance, revealed on intent */}
                    <ArrowUpRight
                        className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        strokeWidth={1.5}
                    />
                </Link>
            ))}
        </div>
    );
}