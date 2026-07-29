// src/components/auction/CountdownTimer.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    endTime: string; // ISO string from backend
    className?: string;
}

export function CountdownTimer({ endTime, className }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

    // Recalculate every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(endTime));
        }, 1000);

        // CRITICAL: Cleanup function to prevent memory leaks
        return () => clearInterval(timer);
    }, [endTime]);

    if (timeLeft.total <= 0) {
        return <span className="text-danger font-bold">Auction Ended</span>;
    }

    const isUrgent = timeLeft.total < 3600000; // Less than 1 hour

    return (
        <div className={cn("flex items-center gap-1.5 text-sm font-medium", isUrgent ? "text-danger" : "text-slate-600", className)}>
            <Clock className="h-4 w-4" />
            <span>
                {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
        </div>
    );
}

// Helper function to calculate time difference
function getTimeLeft(endTime: string) {
    const total = Date.parse(endTime) - Date.parse(new Date().toISOString());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    return { total, hours, minutes, seconds };
}