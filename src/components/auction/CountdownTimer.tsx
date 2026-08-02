"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    endTime: string;
    className?: string;
}

export function CountdownTimer({ endTime, className }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft(endTime)), 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    if (timeLeft.total <= 0) return <span className="text-destructive font-display font-semibold">Ended</span>;

    const isUrgent = timeLeft.total < 3600000; // < 1 hour

    return (
        <div className={cn(
            "flex items-center gap-1.5 font-display font-medium",
            isUrgent ? "text-destructive" : "text-gold",
            className
        )}>
            <Clock className={cn("h-4 w-4", isUrgent && "animate-pulse")} />
            <span>
                {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
        </div>
    );
}

function getTimeLeft(endTime: string) {
    const total = Date.parse(endTime) - Date.parse(new Date().toISOString());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    return { total, hours, minutes, seconds };
}