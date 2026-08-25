/**
 * AUCTIONS API MODULE
 *
 * Single source of truth for everything the frontend asks the backend about
 * auctions. UI components NEVER touch Axios directly — they consume these
 * typed functions. This keeps the backend contract in one place, so if the
 * API shape changes, we fix it here and nowhere else.
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
 * Defensive boundary normalization.
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
 * Strip `undefined` keys so Axios doesn't serialize them into the querystring
 * as empty params (e.g. `?category=`), which would confuse backend filters.
 */
function prune<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== "")
    ) as Partial<T>;
}

export const auctionsApi = {
    /** Fetch a filtered, sorted, paginated slice of the marketplace. */
    async list(query: AuctionQuery = {}): Promise<AuctionPage> {
        const { data } = await api.get<IApiResponse<unknown>>("/auctions", {
            params: prune(query),
        });
        return normalizePage(data.data);
    },

    /** Fetch a single auction by id (flagship detail page, Phase 3). */
    async getById(id: string): Promise<IAuction> {
        const { data } = await api.get<IApiResponse<IAuction>>(`/auctions/${id}`);
        return data.data;
    },
};