"use client"; // Owns a ticking interval → must be a client component.

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";

interface CountdownTimerProps {
    endTime: string | Date;
    startTime?: string | Date;
    className?: string;
    icon?: boolean;
}

/**
 * Urgency tiers — time pressure is LastCall's visual signature.
 * The timer quietly escalates as the lot closes:
 *   > 1h   foreground  (calm, informational)
 *   < 1h   danger      (urgent)
 *   < 60s  danger + pulse (dramatic, but never noisy)
 */
function urgencyClass(msLeft: number): string {
    if (msLeft < 60_000) return "text-destructive animate-pulse";
    if (msLeft < 60 * 60_000) return "text-destructive";
    return "text-foreground";
}

/** Human-readable remaining time: "3d 4h", "2h 14m", "47m 12s". */
function format(msLeft: number): string {
    const total = Math.floor(msLeft / 1000);
    const days = Math.floor(total / 86_400);
    const hours = Math.floor((total % 86_400) / 3_600);
    const mins = Math.floor((total % 3_600) / 60);
    const secs = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${pad(mins)}m`;
    return `${mins}m ${pad(secs)}s`;
}

export function CountdownTimer({ endTime, startTime, className, icon = false }: CountdownTimerProps) {
    const target = useMemo(() => new Date(endTime).getTime(), [endTime]);
    const opens = useMemo(
        () => (startTime ? new Date(startTime).getTime() : 0),
        [startTime]
    );

    /**
     * One shared-shape ticker per timer. At marketplace scale (dozens of
     * cards) this is fine; if we ever render hundreds, centralize into a
     * shared ticker context.
     */
    const now = useNow(1_000);

    if (opens > now) {
        const label = format(opens - now);
        return (
            <span
                className={cn(
                    "inline-flex items-center gap-2 font-semibold tabular-nums text-muted-foreground",
                    className
                )}
            >
                {icon && <Clock className="h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />}
                Starts{" "}
                <span key={label} className="inline-block animate-tick">
                    {label}
                </span>
            </span>
        );
    }

    const msLeft = target - now;

    if (msLeft <= 0) {
        return <span className={cn("tabular-nums font-semibold text-muted-foreground", className)}>Ended</span>;
    }

    const label = format(msLeft);
    const tickSeconds = msLeft < 60 * 60_000;

    return (
        <span
            className={cn(
                // tabular-nums = fixed-width digits → no layout shift as digits tick.
                "inline-flex items-center gap-2 font-semibold tabular-nums transition-colors duration-500",
                urgencyClass(msLeft),
                className
            )}
        >
            {icon && <Clock className="h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />}
            {tickSeconds ? (
                <span key={label} className="inline-block animate-tick">
                    {label}
                </span>
            ) : (
                label
            )}
        </span>
    );
}
