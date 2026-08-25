/**
 * Skeleton mirrors the REAL card geometry (image → meta → footer) so the
 * layout never jumps when data lands. Loading states are design, not an
 * afterthought.
 */
import { Skeleton } from "@/components/ui/skeleton";

export function AuctionCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card">
            {/* Image block: matches aspect-[4/3] of the live card. */}
            <Skeleton className="aspect-[4/3] w-full rounded-none" />

            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Lot / category overline row. */}
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                </div>

                {/* Title row. */}
                <Skeleton className="h-5 w-3/4" />

                {/* Footer: bid block + time block. */}
                <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
}