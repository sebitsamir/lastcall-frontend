/**
 * SOCKET EVENT CONTRACT
 * Single source of truth for event names AND payload shapes.
 * Every consumer (detail page, watchlist, ticker) imports from here, so if
 * the backend ever renames an event or reshapes a payload, we fix ONE file.
 */

export const SOCKET_EVENTS = {
    /** Client → server: subscribe to a specific auction room. */
    joinAuction: "joinAuction",
    /** Server → room: a bid was accepted. Drives live price + history. */
    newBid: "newBid",
    /** Server → user: you lost the lead. Drives the outbid experience. */
    outbid: "outbid",
    /** Server → room: the lot closed and settlement ran. */
    auctionEnded: "auctionEnded",
    /** Server → room: a scheduled lot reached startTime and is now live. */
    auctionStarted: "auctionStarted",
} as const;

/** Payload broadcast to the auction room when a bid is accepted. */
export interface NewBidPayload {
    auctionId: string;
    currentBid: number;        // The new highest bid
    bidderName: string;        // Display name (backend sanitizes)
    bidderId: string;
    bidCount?: number;         // Optional running total for the card footer
}

/** Payload sent to the previous highest bidder when they lose the lead. */
export interface OutbidPayload {
    auctionId: string;
    currentBid: number;
    previousBidderId: string;
    releasedAmount: number;
}

export interface AuctionEndedPayload {
    auctionId: string;
    status: "completed" | "cancelled" | string;
    winnerId?: string;
    winningBid?: number;
    message?: string;
}

export interface AuctionStartedPayload {
    auctionId: string;
    status: "active" | string;
}
