// src/lib/api/bids.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * BIDS API MODULE
 *
 * Thin, typed boundary over the bid endpoint. The Bid Panel never touches
 * Axios; it awaits `bidsApi.place` and maps failures to designed UX states.
 * ────────────────────────────────────────────────────────────────────────────
 */
import api from "@/lib/api";
import type { IApiResponse } from "@/types";

/** A single bid as returned by the populated auction endpoint. */
export interface BidRecord {
    _id: string;
    amount: number;
    /** Backend may populate an object, an id string, or omit entirely. */
    bidder?: { _id?: string; name?: string } | string;
    createdAt: string;
}

/**
 * Endpoint map. If the backend mounts the bid endpoint differently
 * (e.g. `/bids` instead of `/auctions/:id/bid`), fix it here.
 */
const ENDPOINTS = {
    place: (auctionId: string) => `/auctions/${auctionId}/bid`,
} as const;

export const bidsApi = {
    /**
     * Place a bid on an auction.
     * NOTE: payload key mirrors the backend bid controller (`amount`).
     * If your backend expects `bidAmount`, change it here and nowhere else.
     */
    async place(auctionId: string, amount: number): Promise<IApiResponse<unknown>> {
        const { data } = await api.post<IApiResponse<unknown>>(
            ENDPOINTS.place(auctionId),
            { amount }
        );
        return data;
    },
};

/**
 * Defensive reader for a bid's display name across population variants.
 * Keeps the Bid History UI honest when the backend omits relations.
 */
export function bidDisplayName(bid: BidRecord, fallback = "Bidder"): string {
    if (typeof bid.bidder === "string") return fallback; // bare id — don't leak ids
    return bid.bidder?.name ?? fallback;
}