// src/lib/bidding/rules.ts
/**
 * BIDDING RULES (client-side mirrors)
 * The BACKEND is the authority on money. These helpers exist purely for UX
 * pre-validation and display — never for trust. If they drift from the
 * server, the server wins and our error mapper catches it.
 */
import type { IAuction } from "@/types";

/**
 * Minimum acceptable next bid.
 * Tolerates backend schema variants (minNextBid / bidIncrement) and falls
 * back to "strictly higher than current" — the one rule every auction shares.
 */
export function minimumNextBid(auction: IAuction): number {
    const a = auction as Record<string, unknown>;
    const current = auction.currentBid ?? auction.startingPrice ?? 0;

    if (typeof a.minNextBid === "number") return a.minNextBid;
    if (typeof a.bidIncrement === "number") return current + a.bidIncrement;
    return current + 1;
}

/**
 * Liquid (non-frozen) funds for the signed-in user.
 * The wallet model has evolved over time; read defensively across variants.
 */
export function availableBalance(user: unknown): number {
    const u = (user ?? {}) as Record<string, unknown>;
    if (typeof u.availableBalance === "number") return u.availableBalance;
    if (typeof u.balance === "number") return u.balance;

    const wallet = (u.wallet ?? {}) as Record<string, unknown>;
    return typeof wallet.available === "number" ? wallet.available : 0;
}