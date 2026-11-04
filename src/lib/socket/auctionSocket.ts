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
    type AuctionEndedPayload,
} from "./events";

interface SubscribeOptions {
    auctionId: string;
    onNewBid?: (payload: NewBidPayload) => void;
    onOutbid?: (payload: OutbidPayload) => void;
    onAuctionEnded?: (payload: AuctionEndedPayload) => void;
}

export function subscribeToAuction({
    auctionId,
    onNewBid,
    onOutbid,
    onAuctionEnded,
}: SubscribeOptions): () => void {
    const socket = getSocket();

    socket.emit(SOCKET_EVENTS.joinAuction, auctionId);

    if (onNewBid) socket.on(SOCKET_EVENTS.newBid, onNewBid);
    if (onOutbid) socket.on(SOCKET_EVENTS.outbid, onOutbid);
    if (onAuctionEnded) socket.on(SOCKET_EVENTS.auctionEnded, onAuctionEnded);

    return () => {
        if (onNewBid) socket.off(SOCKET_EVENTS.newBid, onNewBid);
        if (onOutbid) socket.off(SOCKET_EVENTS.outbid, onOutbid);
        if (onAuctionEnded) socket.off(SOCKET_EVENTS.auctionEnded, onAuctionEnded);
    };
}