// src/store/notificationStore.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * NOTIFICATION STORE
 * In-app notifications for lots the user is connected to (watching or bidding).
 * Items are persisted per user in localStorage so the bell survives reloads;
 * nothing here ever talks to the backend — it is fed by the socket layer
 * (see NotificationManager) and read by the header bell.
 * ────────────────────────────────────────────────────────────────────────────
 */
import { create } from "zustand";

export type NotificationKind = "outbid" | "newBid" | "endingSoon" | "ended";

export interface AppNotification {
    id: string;
    kind: NotificationKind;
    auctionId: string;
    title: string;
    message: string;
    /** ISO timestamp — matches `timeAgo()` in lib/formatting. */
    ts: string;
    read: boolean;
}

export type NewNotification = Omit<AppNotification, "id" | "ts" | "read"> & { read?: boolean };

/** The bell is a recent-activity feed, not an archive. */
const MAX_ITEMS = 50;
/** Dedupe keys ("<auctionId>:soon") are tiny, but still bounded. */
const MAX_FIRED = 300;

interface Persisted {
    items: AppNotification[];
    fired: string[];
}

interface NotificationState {
    userId: string | null;
    items: AppNotification[];
    /** One-shot alerts already raised (ending soon / ended), so they never repeat. */
    fired: string[];

    /** Load (or clear, with null) the feed belonging to a user. */
    hydrate: (userId: string | null) => void;
    push: (n: NewNotification) => void;
    markAllRead: () => void;
    clear: () => void;
    hasFired: (key: string) => boolean;
    markFired: (key: string) => void;
}

const storageKey = (userId: string) => `lastcall:notifications:${userId}`;

function load(userId: string): Persisted {
    try {
        const raw = window.localStorage.getItem(storageKey(userId));
        if (!raw) return { items: [], fired: [] };
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        return {
            items: Array.isArray(parsed.items) ? parsed.items.slice(0, MAX_ITEMS) : [],
            fired: Array.isArray(parsed.fired) ? parsed.fired.slice(-MAX_FIRED) : [],
        };
    } catch {
        return { items: [], fired: [] };
    }
}

function save(userId: string | null, data: Persisted) {
    if (!userId) return;
    try {
        window.localStorage.setItem(storageKey(userId), JSON.stringify(data));
    } catch {
        // Private mode / quota: the feed simply becomes session-only.
    }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    userId: null,
    items: [],
    fired: [],

    hydrate: (userId) => {
        if (!userId) {
            set({ userId: null, items: [], fired: [] });
            return;
        }
        set({ userId, ...load(userId) });
    },

    push: (n) => {
        const { userId, items, fired } = get();
        if (!userId) return;

        // A fresher fact about the same lot replaces the stale, unread one:
        //  - repeated bids on a lot collapse into the latest bid
        //  - being outbid supersedes the "new bid" that caused it
        const next = items.filter((existing) => {
            if (existing.auctionId !== n.auctionId || existing.read) return true;
            if (n.kind === "newBid") return existing.kind !== "newBid";
            if (n.kind === "outbid") return existing.kind !== "newBid" && existing.kind !== "outbid";
            return true;
        });

        const item: AppNotification = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            kind: n.kind,
            auctionId: n.auctionId,
            title: n.title,
            message: n.message,
            ts: new Date().toISOString(),
            read: n.read ?? false,
        };

        const updated = [item, ...next].slice(0, MAX_ITEMS);
        set({ items: updated });
        save(userId, { items: updated, fired });
    },

    markAllRead: () => {
        const { userId, items, fired } = get();
        if (!items.some((i) => !i.read)) return;
        const updated = items.map((i) => (i.read ? i : { ...i, read: true }));
        set({ items: updated });
        save(userId, { items: updated, fired });
    },

    clear: () => {
        const { userId, fired } = get();
        set({ items: [] });
        save(userId, { items: [], fired });
    },

    hasFired: (key) => get().fired.includes(key),

    markFired: (key) => {
        const { userId, items, fired } = get();
        if (fired.includes(key)) return;
        const updated = [...fired, key].slice(-MAX_FIRED);
        set({ fired: updated });
        save(userId, { items, fired: updated });
    },
}));

/** Selector helper: number of unread notifications. */
export const selectUnreadCount = (s: NotificationState) => s.items.filter((i) => !i.read).length;
