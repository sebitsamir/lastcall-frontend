/**
 * Skeleton mirrors the REAL card geometry (image → meta → price → footer) so
 * the layout never jumps when data lands. Loading states are design, not an
 * afterthought.
 */
import { Skeleton } from "@/components/ui/skeleton";

export function AuctionCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-card">
            {/* Image block: matches aspect-[4/3] of the live card. */}
            <Skeleton className="aspect-[4/3] w-full rounded-none" />

            <div className="flex flex-1 flex-col gap-3 p-[18px] max-[560px]:p-3">
                {/* Category row. */}
                <Skeleton className="h-3 w-16" />

                {/* Title row. */}
                <Skeleton className="h-5 w-3/4" />

                {/* Price + bids. */}
                <div className="flex items-end justify-between">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-4 w-12" />
                </div>

                {/* Footer: time. */}
                <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16 max-[560px]:hidden" />
                </div>
            </div>
        </div>
    );
}
