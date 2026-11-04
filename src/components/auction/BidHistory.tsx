/**
 * BID HISTORY
 * A quiet activity feed. Most recent first — the number that matters (the
 * latest bid) is the one you see without scrolling. "You" rows are tinted
 * green: your position must be unmistakable.
 */
import { bidDisplayName, type BidRecord } from "@/lib/api/bids";
import { formatMoney, timeAgo } from "@/lib/formatting/format";
import { cn } from "@/lib/utils";

interface BidHistoryProps {
    bids: BidRecord[];
    currentUserId?: string; // From the auth store; enables "You" detection.
}

/** Two-letter monogram for the avatar bubble. */
function monogram(name: string, isYou: boolean): string {
    if (isYou) return "YOU";
    return name.replace("@", "").slice(0, 2).toUpperCase();
}

export function BidHistory({ bids, currentUserId }: BidHistoryProps) {
    // Newest first; never mutate the prop — sort a copy.
    const ordered = [...bids].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (ordered.length === 0) {
        return (
            <p className="rounded-card border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted-foreground">
                No bids yet. The floor is yours.
            </p>
        );
    }

    return (
        <ol>
            {ordered.map((bid, index) => {
                const isYou =
                    typeof bid.bidder === "object" && bid.bidder?._id === currentUserId;
                const name = isYou ? "You" : bidDisplayName(bid);

                return (
                    <li
                        key={bid._id}
                        className={cn(
                            "flex items-center gap-3.5 py-3 text-sm",
                            index !== 0 && "border-t border-border"
                        )}
                    >
                        <span
                            className={cn(
                                "grid h-10 w-10 flex-none place-items-center rounded-full text-xs font-bold",
                                isYou ? "bg-success/15 text-success" : "bg-surface-3 text-foreground"
                            )}
                            aria-hidden="true"
                        >
                            {monogram(name, isYou)}
                        </span>

                        <p className="min-w-0 flex-1 text-muted-foreground">
                            <b className="truncate font-semibold text-foreground">{name}</b>
                            {index === 0 && " · highest bid"}
                            <br />
                            <small className="text-xs tabular-nums">{timeAgo(bid.createdAt)}</small>
                        </p>

                        <b
                            className={cn(
                                "shrink-0 font-semibold tabular-nums",
                                index === 0 ? "text-primary-text" : "text-foreground"
                            )}
                        >
                            {formatMoney(bid.amount)}
                        </b>
                    </li>
                );
            })}
        </ol>
    );
}
