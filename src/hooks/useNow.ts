// src/hooks/useNow.ts
/**
 * A ticking "now" for client components that derive display state from the
 * clock (progress bars, "ending soon" chips). `Date.now()` is read in a lazy
 * initializer and an interval — never directly during render — so components
 * stay pure.
 */
import { useEffect, useState } from "react";

export function useNow(intervalMs = 1_000): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return now;
}
