import type { IAuction } from "@/types";

export type LotStatus = "upcoming" | "active" | "completed" | "cancelled";

/** True when a lot still belongs on the public floor. */
export function isOpenLot(auction: Pick<IAuction, "status" | "endTime">, now = Date.now()): boolean {
    if (auction.status === "completed" || auction.status === "cancelled") return false;
    const end = new Date(auction.endTime).getTime();
    return Number.isFinite(end) && end > now;
}

/** Status the UI should show, even if the backend is a minute behind the cron. */
export function displayStatus(
    auction: Pick<IAuction, "status" | "startTime" | "endTime">,
    now = Date.now()
): LotStatus {
    if (auction.status === "cancelled") return "cancelled";
    if (auction.status === "completed") return "completed";

    const end = new Date(auction.endTime).getTime();
    if (Number.isFinite(end) && end <= now) return "completed";

    const start = auction.startTime ? new Date(auction.startTime).getTime() : 0;
    if (Number.isFinite(start) && start > now) return "upcoming";

    return "active";
}

export function isLiveLot(auction: Pick<IAuction, "status" | "startTime" | "endTime">, now = Date.now()): boolean {
    return displayStatus(auction, now) === "active";
}
