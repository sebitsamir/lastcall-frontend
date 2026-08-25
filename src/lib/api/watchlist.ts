// src/lib/api/watchlist.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WATCHLIST API MODULE
 * Entries may arrive as raw auctions OR as { auction } wrappers depending on
 * population. normalizeWatchlist absorbs both so pages never care.
 * ────────────────────────────────────────────────────────────────────────────
 */
import api from "@/lib/api";
import type { IAuction, IApiResponse } from "@/types";

const ENDPOINTS = {
    list: "/users/watchlist",
    toggle: (auctionId: string) => `/users/watchlist/${auctionId}`,
} as const;

function normalizeWatchlist(payload: unknown): IAuction[] {
    if (!Array.isArray(payload)) return [];

    return payload
        .map((entry) => {
            const e = entry as Record<string, unknown>;
            // { auction: {...} } wrapper vs raw auction object
            return (e?.auction ?? entry) as IAuction;
        })
        // Drop malformed entries instead of crashing the whole page.
        .filter((a) => !!a && typeof a === "object" && "_id" in a);
}

export const watchlistApi = {
    async list(): Promise<IAuction[]> {
        const { data } = await api.get<IApiResponse<unknown>>(ENDPOINTS.list);
        return normalizeWatchlist(data.data);
    },

    async toggle(auctionId: string): Promise<IApiResponse<unknown>> {
        const { data } = await api.post<IApiResponse<unknown>>(ENDPOINTS.toggle(auctionId));
        return data;
    },
};