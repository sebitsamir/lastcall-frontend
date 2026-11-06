"use client";

import { Badge } from "@/components/ui/badge";
import { useNow } from "@/hooks/useNow";
import { displayStatus } from "@/lib/auction/status";

type AuctionStatus = "upcoming" | "active" | "completed" | "cancelled";

const CONFIG: Record<AuctionStatus, { label: string; variant: "live" | "upcoming" | "ended" | "cancelled"; dot?: boolean }> = {
    active: { label: "Live", variant: "live", dot: true },
    upcoming: { label: "Upcoming", variant: "upcoming" },
    completed: { label: "Ended", variant: "ended" },
    cancelled: { label: "Cancelled", variant: "cancelled" },
};

const ENDING_SOON_MS = 60 * 60 * 1000;

interface StatusBadgeProps {
    status: string;
    dot?: boolean;
    className?: string;
    endTime?: string | Date;
    startTime?: string | Date;
}

export function StatusBadge({ status, dot, className, endTime, startTime }: StatusBadgeProps) {
    const now = useNow(1_000);
    const resolved = displayStatus(
        {
            status: (status as AuctionStatus) || "completed",
            startTime: startTime ? String(startTime) : "",
            endTime: endTime ? String(endTime) : new Date(now).toISOString(),
        },
        now
    );
    const c = CONFIG[resolved] ?? CONFIG.completed;

    if (resolved === "active" && endTime) {
        const msLeft = new Date(endTime).getTime() - now;
        if (msLeft > 0 && msLeft < ENDING_SOON_MS) {
            return (
                <Badge variant="red" className={className}>
                    Ending soon
                </Badge>
            );
        }
    }

    return (
        <Badge variant={c.variant} dot={dot ?? c.dot} className={className}>
            {c.label}
        </Badge>
    );
}
