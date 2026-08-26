// src/lib/api/auctions.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * AUCTIONS API MODULE
 *
 * Single source of truth for everything the frontend asks the backend about
 * auctions. UI components NEVER touch Axios directly — they consume these
 * typed functions. This keeps the backend contract in one place, so if the
 * API shape changes, we fix it here and nowhere else.
 * ────────────────────────────────────────────────────────────────────────────
 */
import api from "@/lib/api";
import type { IAuction, IApiResponse } from "@/types";

/** Sort strategies the backend explicitly supports. Union type = compile-time safety. */
export type AuctionSort = "newest" | "endingSoon" | "priceLow" | "priceHigh";

/** Query surface exposed to the UI (filters, search, pagination). */
export interface AuctionQuery {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: AuctionSort;
    page?: number;
    limit?: number;
}

/** Normalized page shape the UI can rely on, regardless of backend quirks. */
export interface AuctionPage {
    auctions: IAuction[];
    pagination: { page: number; pages: number; total: number };
}

/** Seller payload — mirrors the Auction model's writable fields (Phase 5). */
export interface AuctionDraftPayload {
    title: string;
    category: string;
    description: string;
    images: string[];
    startingPrice: number;
    startTime?: string; // ISO; omitted = starts immediately (backend decides)
    endTime: string;    // ISO
}

/** Category whitelist — drives filter UI and prevents free-text garbage reaching the API. */
export const AUCTION_CATEGORIES = [
    "Art",
    "Watches",
    "Electronics",
    "Collectibles",
    "Fashion",
    "Sports",
] as const;

/**
 * Endpoint map. If the backend mounts these differently, fix them here
 * and the entire app updates automatically.
 */
const ENDPOINTS = {
    list: "/auctions",
    mine: "/auctions/mine",
    byId: (id: string) => `/auctions/${id}`,
    create: "/auctions",
    cancel: (id: string) => `/auctions/${id}/cancel`,
} as const;

/**
 * Defensive boundary normalization for paginated lists.
 * The backend has historically returned either a bare array (legacy) or a
 * paginated object. Instead of scattering `Array.isArray` checks across the
 * UI, we absorb that ambiguity ONCE, at the boundary.
 */
function normalizePage(payload: unknown): AuctionPage {
    // Legacy path: bare array of auctions.
    if (Array.isArray(payload)) {
        return {
            auctions: payload as IAuction[],
            pagination: { page: 1, pages: 1, total: (payload as IAuction[]).length },
        };
    }

    // Modern path: { auctions, pagination } envelope.
    const p = (payload ?? {}) as Record<string, unknown>;
    const auctions = Array.isArray(p.auctions)
        ? (p.auctions as IAuction[])
        : Array.isArray(p.data)
            ? (p.data as IAuction[])
            : [];

    const pag = (p.pagination ?? {}) as Record<string, number>;

    return {
        auctions,
        pagination: {
            page: pag.page ?? 1,
            // Tolerate both naming conventions the backend has used over time.
            pages: pag.pages ?? pag.totalPages ?? 1,
            total: pag.total ?? auctions.length,
        },
    };
}

/**
 * Normalize a single auction response. Tolerates { auction: {...} } envelopes
 * or bare auction objects.
 */
function normalizeAuction(payload: unknown): IAuction {
    const p = (payload ?? {}) as Record<string, unknown>;
    const auction = (p.auction ?? payload) as IAuction;
    if (!auction || typeof auction !== "object" || !("_id" in auction)) {
        throw new Error("Invalid auction payload");
    }
    return auction;
}

/**
 * Normalize a list of auctions (e.g., for /auctions/mine).
 */
function normalizeAuctionList(payload: unknown): IAuction[] {
    if (Array.isArray(payload)) return payload as IAuction[];
    const p = (payload ?? {}) as Record<string, unknown>;
    if (Array.isArray(p.auctions)) return p.auctions as IAuction[];
    if (Array.isArray(p.data)) return p.data as IAuction[];
    return [];
}

/**
 * Strip `undefined` keys so Axios doesn't serialize them into the querystring
 * as empty params (e.g. `?category=`), which would confuse backend filters.
 */
function prune<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== "")
    ) as Partial<T>;
}

export const auctionsApi = {
    /** Fetch a filtered, sorted, paginated slice of the marketplace. */
    async list(query: AuctionQuery = {}): Promise<AuctionPage> {
        const { data } = await api.get<IApiResponse<unknown>>(ENDPOINTS.list, {
            params: prune(query),
        });
        return normalizePage(data.data);
    },

    /** Fetch a single auction by id (flagship detail page, Phase 3). */
    async getById(id: string): Promise<IAuction> {
        const { data } = await api.get<IApiResponse<unknown>>(ENDPOINTS.byId(id));
        return normalizeAuction(data.data);
    },

    /** Create a new lot (Phase 5). Returns the created auction. */
    async create(payload: AuctionDraftPayload): Promise<IAuction> {
        const { data } = await api.post<IApiResponse<unknown>>(ENDPOINTS.create, payload);
        return normalizeAuction(data.data);
    },

    /** Update an UPCOMING lot (Phase 5). Backend rejects edits once live. */
    async update(id: string, payload: Partial<AuctionDraftPayload>): Promise<IAuction> {
        const { data } = await api.patch<IApiResponse<unknown>>(ENDPOINTS.byId(id), payload);
        return normalizeAuction(data.data);
    },

    /** Cancel a lot (Phase 5). The backend refunds the highest bidder where applicable. */
    async cancel(id: string): Promise<IApiResponse<unknown>> {
        const { data } = await api.post<IApiResponse<unknown>>(ENDPOINTS.cancel(id));
        return data;
    },

    /** The signed-in user's own lots, all statuses (Phase 5). */
    async mine(): Promise<IAuction[]> {
        const { data } = await api.get<IApiResponse<unknown>>(ENDPOINTS.mine);
        return normalizeAuctionList(data.data);
    },
};