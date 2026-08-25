// src/lib/watchlist/state.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WATCHLIST STATE ENGINE (pure, unit-testable)
 * The watchlist is not a folder of cards — it's a positions board.
 * Every watched lot resolves to exactly one human-readable state:
 *
 *   winning     active + you hold the highest bid
 *   outbid      active + you bid but lost the lead
 *   endingSoon  active + < 1h on the clock (urgency surfaces early)
 *   watching    active + no position yet
 *   ended       hammer fell
 *   cancelled   withdrawn by the seller
 *
 * No React in here: pure functions in, verdicts out.
 * ────────────────────────────────────────────────────────────────────────────
 */
import type { IAuction } from "@/types";

export type WatchState =
    | "winning"
    | "outbid"
    | "endingSoon"
    | "watching"
    | "ended"
    | "cancelled";

/** Urgency window: a lot "ending soon" inside one hour. */
export const ENDING_SOON_MS = 60 * 60 * 1000;

/**
 * Resolve a lot's state for the signed-in user.
 * `bidAuctionIds` = auctions the user has bid on (from /users/bids),
 * needed because "outbid" is only knowable if you were ever in the lot.
 */
export function deriveWatchState(
    auction: IAuction,
    userId: string | undefined,
    bidAuctionIds: Set<string>
): WatchState {
    // Terminal states win outright — time pressure is irrelevant.
    if (auction.status === "cancelled") return "cancelled";
    if (auction.status !== "active") return "ended";

    // Highest bidder may arrive populated (object) or as a bare id string.
    const highest = (auction as Record<string, unknown>).highestBidder as
        | { _id?: string }
        | string
        | undefined;
    const highestId =
        typeof highest === "object" && highest ? highest._id : typeof highest === "string" ? highest : undefined;

    if (highestId && userId && highestId === userId) return "winning";
    if (bidAuctionIds.has(auction._id)) return "outbid";

    const msLeft = new Date(auction.endTime).getTime() - Date.now();
    if (msLeft <= ENDING_SOON_MS) return "endingSoon";

    return "watching";
}

/**
 * Ordering rule: live lots first, soonest-ending on top (the doc's mandate);
 * closed lots sink to the bottom, most recent first.
 */
export function sortWatchlist(lots: IAuction[]): IAuction[] {
    return [...lots].sort((a, b) => {
        const aActive = a.status === "active" ? 0 : 1;
        const bActive = b.status === "active" ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive; // never mutate the prop

        const aT = new Date(a.endTime).getTime();
        const bT = new Date(b.endTime).getTime();
        return aActive === 0 ? aT - bT : bT - aT; // active ↑ urgency, closed ↓ recency
    });
}