"use client"; // Owns a ticking interval → must be a client component.

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
    endTime: string | Date; // ISO string from the backend or a Date instance.
    className?: string;
}

/**
 * Urgency tiers — time pressure is LastCall's visual signature.
 * The timer quietly escalates as the lot closes:
 *   > 1h   muted      (calm, informational)
 *   < 1h   foreground (attention)
 *   < 5m   bright gold (urgency)
 *   < 60s  danger + pulse (dramatic, but never noisy)
 */
function urgencyClass(msLeft: number): string {
    if (msLeft < 60_000) return "text-destructive animate-pulse";
    if (msLeft < 5 * 60_000) return "text-accent";
    if (msLeft < 60 * 60_000) return "text-foreground";
    return "text-muted-foreground";
}

/** Human-readable remaining time. Days collapse to "2d 04h" beyond 24h. */
function format(msLeft: number): string {
    const total = Math.floor(msLeft / 1000);
    const days = Math.floor(total / 86_400);
    const hours = Math.floor((total % 86_400) / 3_600);
    const mins = Math.floor((total % 3_600) / 60);
    const secs = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");

    if (days > 0) return `${days}d ${pad(hours)}h`;
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export function CountdownTimer({ endTime, className }: CountdownTimerProps) {
    // Memoize the target so re-renders don't re-parse the date string.
    const target = useMemo(() => new Date(endTime).getTime(), [endTime]);

    // Lazy-initialize `now` to avoid a meaningless first render at 0.
    const [now, setNow] = useState(() => Date.now());

    /**
     * One interval per timer. At marketplace scale (dozens of cards) this is
     * fine; if we ever render hundreds, centralize into a shared ticker context.
     * Cleanup is mandatory — leaked intervals are a classic SPA memory leak.
     */
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1_000);
        return () => clearInterval(id);
    }, []);

    const msLeft = target - now;

    // Terminal state: never render negative time.
    if (msLeft <= 0) {
        return <span className={cn("tabular-nums", className)}>ENDED</span>;
    }

    return (
        <span
            className={cn(
                // tabular-nums = fixed-width digits → no layout shift as digits tick.
                "tabular-nums transition-colors duration-500",
                urgencyClass(msLeft),
                className
            )}
        >
            {format(msLeft)}
        </span>
    );
}