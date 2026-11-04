// src/components/notifications/NotificationManager.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * NOTIFICATION MANAGER
 * Headless. Turns socket traffic into bell notifications for lots the user is
 * CONNECTED to — lots on their watchlist or that they have bid on.
 *
 *   newBid  (room)  → someone else bid on a lot you watch / bid on
 *   outbid  (user)  → you lost the lead (also toasts, the most time-critical)
 *   clock           → "ending soon" (< 1h) and "ended" for connected lots
 *
 * The connected set comes from the existing watchlist + my-bids endpoints and
 * is refreshed on navigation, on focus and every minute, so hearts and bids
 * made anywhere are picked up without touching those flows.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import type { IAuction } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { watchlistApi } from "@/lib/api/watchlist";
import { usersApi } from "@/lib/api/users";
import { getSocket } from "@/lib/socket";
import {
    SOCKET_EVENTS,
    type NewBidPayload,
    type OutbidPayload,
} from "@/lib/socket/events";
import { formatMoney } from "@/lib/formatting/format";

type Relation = "watching" | "bidding";

interface TrackedLot {
    title: string;
    endTime: number;
    relation: Relation;
}

const REFRESH_MS = 60_000;
const CLOCK_MS = 30_000;
const ENDING_SOON_MS = 60 * 60 * 1000;
const FALLBACK_TITLE = "a lot you follow";

export function NotificationManager() {
    const { user, isAuthenticated } = useAuthStore();
    const userId = (user as { _id?: string } | null)?._id;

    const pathname = usePathname();

    /** The lot page the user is looking at already shows its own live UI. */
    const pathRef = useRef(pathname);
    useEffect(() => {
        pathRef.current = pathname;
    }, [pathname]);

    const lots = useRef<Map<string, TrackedLot>>(new Map());
    const requestId = useRef(0); // stale-response guard

    const viewing = useCallback(
        (auctionId: string) => pathRef.current === `/auctions/${auctionId}`,
        []
    );

    /* ── Feed lifecycle: one feed per signed-in user ───────────────────── */
    useEffect(() => {
        if (!isAuthenticated || !userId) return;
        useNotificationStore.getState().hydrate(userId);
        return () => useNotificationStore.getState().hydrate(null);
    }, [isAuthenticated, userId]);

    /* ── Connected set: watchlist ∪ my bids (active lots only) ─────────── */
    const refresh = useCallback(() => {
        const id = ++requestId.current;

        Promise.allSettled([watchlistApi.list(), usersApi.myBids()]).then(
            ([watchResult, bidsResult]) => {
                if (id !== requestId.current) return;
                // Both failed → keep what we have rather than going deaf.
                if (watchResult.status === "rejected" && bidsResult.status === "rejected") return;

                const next = new Map<string, TrackedLot>();

                const track = (auction: IAuction | undefined, relation: Relation) => {
                    if (!auction?._id || auction.status !== "active") return;
                    const endTime = new Date(auction.endTime).getTime();
                    if (!Number.isFinite(endTime)) return;
                    next.set(auction._id, { title: auction.title, endTime, relation });
                };

                if (watchResult.status === "fulfilled") {
                    watchResult.value.forEach((a) => track(a, "watching"));
                }
                if (bidsResult.status === "fulfilled") {
                    bidsResult.value.forEach((b) => track(b.auction, "bidding")); // bidding wins
                }

                // Lots that just ended stay until the clock has announced them.
                const now = Date.now();
                lots.current.forEach((lot, lotId) => {
                    if (!next.has(lotId) && lot.endTime <= now) next.set(lotId, lot);
                });

                // Join rooms for lots we weren't already in.
                const socket = getSocket();
                next.forEach((_, lotId) => {
                    if (!lots.current.has(lotId)) socket.emit(SOCKET_EVENTS.joinAuction, lotId);
                });

                lots.current = next;
            }
        );
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !userId) return;
        refresh();
    }, [isAuthenticated, userId, pathname, refresh]);

    useEffect(() => {
        if (!isAuthenticated || !userId) return;

        const interval = setInterval(refresh, REFRESH_MS);
        const onFocus = () => refresh();
        window.addEventListener("focus", onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", onFocus);
        };
    }, [isAuthenticated, userId, refresh]);

    /* ── Socket listeners ──────────────────────────────────────────────── */
    useEffect(() => {
        if (!isAuthenticated || !userId) return;

        const socket = getSocket();

        // Server-side rooms are lost on reconnect — rejoin everything.
        const rejoin = () => {
            lots.current.forEach((_, lotId) => socket.emit(SOCKET_EVENTS.joinAuction, lotId));
        };

        const onNewBid = (payload: NewBidPayload) => {
            const lot = lots.current.get(payload.auctionId);
            if (!lot) return; // not a lot we follow

            // Your own bids are not news to you.
            if (payload.bidderId === userId || payload.bidderName === "You") return;

            useNotificationStore.getState().push({
                kind: "newBid",
                auctionId: payload.auctionId,
                title: lot.title,
                message: `${payload.bidderName} bid ${formatMoney(payload.currentBid)} on ${lot.title}.`,
                read: viewing(payload.auctionId),
            });
        };

        const onOutbid = (payload: OutbidPayload) => {
            if (payload.previousBidderId !== userId) return;
            const lot = lots.current.get(payload.auctionId);
            const title = lot?.title ?? FALLBACK_TITLE;
            const isViewing = viewing(payload.auctionId);

            const released =
                typeof payload.releasedAmount === "number"
                    ? ` ${formatMoney(payload.releasedAmount)} was released to your balance.`
                    : "";

            useNotificationStore.getState().push({
                kind: "outbid",
                auctionId: payload.auctionId,
                title,
                message: `You were outbid on ${title}. The bid is now ${formatMoney(payload.currentBid)}.${released}`,
                read: isViewing,
            });

            // The lot page has its own outbid surface; elsewhere, tell them now.
            if (!isViewing) toast.error(`You were outbid on ${title}`);
        };

        socket.on("connect", rejoin);
        socket.on(SOCKET_EVENTS.newBid, onNewBid);
        socket.on(SOCKET_EVENTS.outbid, onOutbid);
        rejoin(); // socket may already be connected when we mount

        return () => {
            socket.off("connect", rejoin);
            socket.off(SOCKET_EVENTS.newBid, onNewBid);
            socket.off(SOCKET_EVENTS.outbid, onOutbid);
        };
    }, [isAuthenticated, userId, viewing]);

    /* ── Clock alerts: ending soon / ended ─────────────────────────────── */
    useEffect(() => {
        if (!isAuthenticated || !userId) return;

        const tick = () => {
            const store = useNotificationStore.getState();
            const now = Date.now();

            lots.current.forEach((lot, lotId) => {
                const msLeft = lot.endTime - now;
                const endedKey = `${lotId}:ended`;
                const soonKey = `${lotId}:soon`;

                if (msLeft <= 0) {
                    if (!store.hasFired(endedKey)) {
                        store.markFired(endedKey);
                        store.push({
                            kind: "ended",
                            auctionId: lotId,
                            title: lot.title,
                            message:
                                lot.relation === "bidding"
                                    ? `${lot.title} has ended. Check the result of your bid.`
                                    : `${lot.title} has ended.`,
                            read: viewing(lotId),
                        });
                    }
                    lots.current.delete(lotId);
                    return;
                }

                if (msLeft <= ENDING_SOON_MS && !store.hasFired(soonKey)) {
                    store.markFired(soonKey);
                    store.push({
                        kind: "endingSoon",
                        auctionId: lotId,
                        title: lot.title,
                        message:
                            lot.relation === "bidding"
                                ? `${lot.title} ends in under an hour — you have a bid on it.`
                                : `${lot.title} ends in under an hour.`,
                        read: viewing(lotId),
                    });
                }
            });
        };

        const interval = setInterval(tick, CLOCK_MS);
        return () => clearInterval(interval);
    }, [isAuthenticated, userId, viewing]);

    return null;
}
