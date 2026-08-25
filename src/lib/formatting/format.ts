/**
 * PRESENTATION UTILITIES
 * Pure functions only. No React, no side effects — trivially unit-testable.
 */

/**
 * Format money as whole-dollar USD.
 * Auction figures read cleaner without cents ("$12,850" > "$12,850.00").
 * `Math.round` guards against float drift coming from the backend.
 */
export function formatMoney(value: number): string {
    return `$${Math.round(value).toLocaleString("en-US")}`;
}

/**
 * Derive a stable, human-friendly lot number ("028") from a Mongo ObjectId.
 * We use the last 3 hex chars as a seed so the number is deterministic per
 * auction (unlike index-based numbering, which shifts with pagination).
 */
export function lotNumber(id: string): string {
    const seed = parseInt(id.slice(-3), 16) % 999; // hex → bounded int
    return String(seed + 1).padStart(3, "0");
}

/**
 * Relative time for the bid history ("Just now", "42 sec ago", "2 min ago").
 * Floors at days — beyond that, absolute dates read more trustworthy.
 */
export function timeAgo(iso: string): string {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds} sec ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
}