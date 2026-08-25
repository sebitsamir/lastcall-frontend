// src/lib/api/wallet.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WALLET API MODULE
 * The wallet is the trust core of LastCall: available vs reserved funds.
 * Endpoint paths live in ONE map — if the backend differs, fix here only.
 * ────────────────────────────────────────────────────────────────────────────
 */
import api from "@/lib/api";
import type { IApiResponse } from "@/types";

const ENDPOINTS = {
    deposit: "/users/wallet/deposit",
    transactions: "/users/wallet/transactions",
} as const;

/** A ledger entry. `type` drives icon, sign and color in the UI. */
export interface ITransaction {
    _id: string;
    type: string;               // deposit | bid_reserved | bid_released | purchase | payout | refund
    amount: number;
    description?: string;
    createdAt: string;
}

export interface TransactionPage {
    transactions: ITransaction[];
    pagination: { page: number; pages: number; total: number };
}

export interface WalletSnapshot {
    available: number;  // liquid funds
    frozen: number;     // reserved while leading a bid
    total: number;      // buying power = available + frozen
}

/** Finite-number guard; schema readers must never NaN the UI. */
const num = (v: unknown): number | undefined =>
    typeof v === "number" && Number.isFinite(v) ? v : undefined;

/**
 * Read wallet numbers off the `/users/me` user object.
 * The schema has evolved (flat fields vs nested wallet) — tolerate both.
 */
export function walletSnapshot(user: unknown): WalletSnapshot {
    const u = (user ?? {}) as Record<string, unknown>;
    const wallet = (u.wallet ?? {}) as Record<string, unknown>;

    const available = num(u.availableBalance) ?? num(wallet.available) ?? num(u.balance) ?? 0;
    const frozen = num(u.frozenBalance) ?? num(wallet.frozen) ?? 0;

    return { available, frozen, total: available + frozen };
}

/** Same defensive normalization pattern as the auctions module. */
function normalizeTransactions(payload: unknown): TransactionPage {
    const list = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as Record<string, unknown>)?.transactions)
            ? ((payload as Record<string, unknown>).transactions as unknown[])
            : [];

    const pag = ((payload as Record<string, unknown>)?.pagination ?? {}) as Record<string, number>;

    return {
        transactions: list as ITransaction[],
        pagination: {
            page: pag.page ?? 1,
            pages: pag.pages ?? pag.totalPages ?? 1,
            total: pag.total ?? list.length,
        },
    };
}

export const walletApi = {
    /** Add funds to the available balance. */
    async deposit(amount: number): Promise<IApiResponse<unknown>> {
        const { data } = await api.post<IApiResponse<unknown>>(ENDPOINTS.deposit, { amount });
        return data;
    },

    /** Paginated ledger, newest first (backend sorts; we never re-sort money). */
    async getTransactions(page = 1, limit = 10): Promise<TransactionPage> {
        const { data } = await api.get<IApiResponse<unknown>>(ENDPOINTS.transactions, {
            params: { page, limit },
        });
        return normalizeTransactions(data.data);
    },
};