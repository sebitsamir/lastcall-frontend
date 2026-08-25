/**
 * AUCTION ROOM SUBSCRIPTION
 * Wraps the raw socket (src/lib/socket.ts) with a typed, per-auction API.
 *
 * Returns a cleanup function that removes EVERY listener it added.
 * This is non-negotiable in React 18/19 StrictMode: dev effects run twice,
 * and leaked listeners cause duplicated toasts and ghost state updates.
 */
import { getSocket } from "@/lib/socket";
import {
    SOCKET_EVENTS,
    type NewBidPayload,
    type OutbidPayload,
} from "./events";

interface SubscribeOptions {
    auctionId: string;
    onNewBid?: (payload: NewBidPayload) => void;
    onOutbid?: (payload: OutbidPayload) => void;
}

export function subscribeToAuction({
    auctionId,
    onNewBid,
    onOutbid,
}: SubscribeOptions): () => void {
    const socket = getSocket();

    // Join the server-side room; broadcasts for this auction now reach us.
    socket.emit(SOCKET_EVENTS.joinAuction, auctionId);

    if (onNewBid) socket.on(SOCKET_EVENTS.newBid, onNewBid);
    if (onOutbid) socket.on(SOCKET_EVENTS.outbid, onOutbid);

    // Cleanup: unsubscribe exactly what we registered. Nothing more.
    return () => {
        if (onNewBid) socket.off(SOCKET_EVENTS.newBid, onNewBid);
        if (onOutbid) socket.off(SOCKET_EVENTS.outbid, onOutbid);
    };
}