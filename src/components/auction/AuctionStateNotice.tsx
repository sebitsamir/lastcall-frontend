/**
 * AUCTION STATE NOTICE
 * The backend defines four states; the UI must honor each distinctly.
 * This component renders the non-biddable states (upcoming / completed /
 * cancelled) as designed surfaces — never a generic "unavailable" box.
 */
import { CalendarClock, Flag, Hammer } from "lucide-react";
import { formatMoney } from "@/lib/formatting/format";

interface AuctionStateNoticeProps {
    status: string;
    currentBid?: number;
    startTime?: string;
}

export function AuctionStateNotice({ status, currentBid, startTime }: AuctionStateNoticeProps) {
    // Active auctions render the Bid Panel instead — this component stays silent.
    if (status === "active") return null;

    if (status === "upcoming") {
        return (
            <div className="space-y-2 border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Starts {startTime ? new Date(startTime).toLocaleString() : "soon"}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Bidding opens when the clock starts. Watch this lot to be notified.
                </p>
            </div>
        );
    }

    if (status === "completed") {
        return (
            <div className="space-y-2 border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <Hammer className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Auction ended
                </p>
                <p className="font-serif text-2xl text-foreground tabular-nums">
                    {currentBid != null ? `Winning bid ${formatMoney(currentBid)}` : "Sold"}
                </p>
            </div>
        );
    }

    // cancelled (and any unknown future state fails safe here)
    return (
        <div className="space-y-2 border border-destructive/30 bg-destructive/5 p-5">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-destructive">
                <Flag className="h-3.5 w-3.5" strokeWidth={1.5} />
                Auction cancelled
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
                This lot was withdrawn by the seller. Reserved funds have been released.
            </p>
        </div>
    );
}