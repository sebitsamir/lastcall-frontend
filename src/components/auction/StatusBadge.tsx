import { Badge } from "@/components/ui/badge";

type AuctionStatus = "upcoming" | "active" | "completed" | "cancelled";

const CONFIG: Record<AuctionStatus, { label: string; variant: "live" | "upcoming" | "ended" | "cancelled"; dot?: boolean }> = {
    active: { label: "Live", variant: "live", dot: true },
    upcoming: { label: "Upcoming", variant: "upcoming" },
    completed: { label: "Ended", variant: "ended" },
    cancelled: { label: "Cancelled", variant: "cancelled" },
};

export function StatusBadge({ status, dot, className }: { status: string; dot?: boolean; className?: string }) {
    const c = CONFIG[status as AuctionStatus] ?? CONFIG.completed;
    return (
        <Badge variant={c.variant} dot={dot ?? c.dot} className={className}>
            {c.label}
        </Badge>
    );
}