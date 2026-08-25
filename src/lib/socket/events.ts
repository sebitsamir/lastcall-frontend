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
} as const;

/** Payload broadcast to the auction room when a bid is accepted. */
export interface NewBidPayload {
    auctionId: string;
    currentBid: number;        // The new highest bid
    bidderName: string;        // Display name (backend sanitizes)
    bidderId?: string;         // Present when the backend populates it
    bidCount?: number;         // Optional running total for the card footer
}

/** Payload sent to the previous highest bidder when they lose the lead. */
export interface OutbidPayload {
    auctionId: string;
    currentBid: number;        // What beat you
    releasedAmount?: number;   // Funds the escrow just released back to you
}