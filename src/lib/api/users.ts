// src/lib/api/users.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * USERS API MODULE
 * "My bids" powers the dashboard's active-bids surface and the bids page.
 * ────────────────────────────────────────────────────────────────────────────
 */
import api from "@/lib/api";
import type { IAuction, IApiResponse } from "@/types";

const ENDPOINTS = {
    myBids: "/users/bids",
    // Backend added a name-change endpoint; if yours is mounted elsewhere
    // (e.g. "/users/updateProfile"), fix this ONE line.
    updateProfile: "/users/me",
} as const;

export interface MyBid {
    _id: string;
    amount: number;
    createdAt: string;
    auction?: IAuction;         // populated auction, when the backend provides it
    status?: string;            // backend-provided winning/outbid, when available
}

/** Tolerate { bid, auction } envelopes and flat bid-with-auction shapes. */
function normalizeMyBids(payload: unknown): MyBid[] {
    if (!Array.isArray(payload)) return [];

    return payload.map((entry) => {
        const e = entry as Record<string, unknown>;
        const bid = (e?.bid ?? e) as Record<string, unknown>;
        const auction = (e?.auction ?? bid?.auction) as IAuction | undefined;

        return {
            _id: String(bid._id ?? `${Date.now()}`),
            amount: typeof bid.amount === "number" ? bid.amount : 0,
            createdAt: String(bid.createdAt ?? new Date().toISOString()),
            auction,
            status: typeof bid.status === "string" ? bid.status : undefined,
        };
    });
}

export const usersApi = {
    async myBids(): Promise<MyBid[]> {
        const { data } = await api.get<IApiResponse<unknown>>(ENDPOINTS.myBids);
        return normalizeMyBids(data.data);
    },

    /** Update the signed-in user's display name. */
    async updateProfile(payload: { name: string }): Promise<IApiResponse<unknown>> {
        const { data } = await api.patch<IApiResponse<unknown>>(
            ENDPOINTS.updateProfile,
            payload
        );
        return data;
    },
};