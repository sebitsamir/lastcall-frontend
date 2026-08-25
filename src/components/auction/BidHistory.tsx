/**
 * BID HISTORY
 * A quiet vertical activity line. Most recent first — the number that
 * matters (the latest bid) is the one you see without scrolling.
 * "You" rows are highlighted in gold: your position must be unmistakable.
 */
import { bidDisplayName, type BidRecord } from "@/lib/api/bids";
import { formatMoney, timeAgo } from "@/lib/formatting/format";
import { cn } from "@/lib/utils";

interface BidHistoryProps {
    bids: BidRecord[];
    currentUserId?: string; // From the auth store; enables "You" detection.
}

export function BidHistory({ bids, currentUserId }: BidHistoryProps) {
    // Newest first; never mutate the prop — sort a copy.
    const ordered = [...bids].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (ordered.length === 0) {
        return (
            <p className="border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
                No bids yet. The floor is yours.
            </p>
        );
    }

    return (
        <ol className="space-y-0">
            {ordered.map((bid, index) => {
                const isYou =
                    typeof bid.bidder === "object" && bid.bidder?._id === currentUserId;

                return (
                    <li
                        key={bid._id}
                        className={cn(
                            "relative flex items-baseline justify-between gap-4 py-3 pl-6",
                            // Hairline separators between rows, not boxes around them.
                            index !== ordered.length - 1 && "border-b border-border"
                        )}
                    >
                        {/* The vertical activity line + node */}
                        <span
                            className={cn(
                                "absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full",
                                index === 0 ? "bg-primary" : "bg-border" // Latest bid glows gold
                            )}
                            aria-hidden
                        />

                        {/* Amount: tabular, precise; latest bid in gold */}
                        <span
                            className={cn(
                                "text-sm font-medium tabular-nums",
                                index === 0 ? "text-primary" : "text-foreground"
                            )}
                        >
                            {formatMoney(bid.amount)}
                        </span>

                        {/* Bidder identity */}
                        <span className="flex-1 truncate text-sm text-muted-foreground">
                            {isYou ? (
                                <span className="text-primary">You</span>
                            ) : (
                                bidDisplayName(bid)
                            )}
                        </span>

                        {/* Recency: quiet, right-aligned */}
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground/70">
                            {timeAgo(bid.createdAt)}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}