"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Gavel, Hourglass, TrendingUp, TriangleAlert, type LucideIcon } from "lucide-react";

import {
    selectUnreadCount,
    useNotificationStore,
    type NotificationKind,
} from "@/store/notificationStore";
import { timeAgo } from "@/lib/formatting/format";
import { cn } from "@/lib/utils";

/** Kind → glyph + tint. Red = act now, gold = heads-up, quiet = FYI. */
const KIND_META: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
    outbid: { icon: TriangleAlert, tone: "bg-destructive/13 text-destructive" },
    newBid: { icon: TrendingUp, tone: "bg-primary/12 text-primary-text" },
    endingSoon: { icon: Hourglass, tone: "bg-primary/12 text-primary-text" },
    ended: { icon: Gavel, tone: "bg-secondary text-muted-foreground" },
};

export function NotificationBell() {
    const items = useNotificationStore((s) => s.items);
    const unread = useNotificationStore(selectUnreadCount);
    const markAllRead = useNotificationStore((s) => s.markAllRead);
    const clear = useNotificationStore((s) => s.clear);

    const [open, setOpen] = useState(false);
    const [top, setTop] = useState(0);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const close = () => {
        setOpen(false);
        markAllRead(); // what you saw counts as read
    };

    const toggle = () => {
        if (open) {
            close();
            return;
        }
        // Anchor the panel under the bell (the header can be one or two rows tall).
        const rect = buttonRef.current?.getBoundingClientRect();
        setTop((rect?.bottom ?? 72) + 8);
        setOpen(true);
    };

    /* Outside click + Escape close the panel. */
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
            setOpen(false);
            useNotificationStore.getState().markAllRead();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            setOpen(false);
            useNotificationStore.getState().markAllRead();
            buttonRef.current?.focus();
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={toggle}
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="relative grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
                <Bell className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                {unread > 0 && (
                    <i className="absolute right-1 top-1.5 h-[17px] min-w-[17px] rounded-full bg-primary px-1 text-center text-[10px] font-bold not-italic leading-[17px] tabular-nums text-primary-foreground">
                        {unread > 9 ? "9+" : unread}
                    </i>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Notifications"
                    style={{ top }}
                    className="animate-view-in fixed right-3 z-[70] max-h-[70svh] w-[min(380px,calc(100%-24px))] overflow-auto rounded-panel border border-border-strong bg-card p-5 shadow-lift sm:right-8"
                >
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <h4 className="text-lg">Notifications</h4>
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clear}
                                className="text-[13px] font-semibold text-primary-text"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <p className="py-8 text-center text-sm leading-relaxed text-muted-foreground">
                            You&apos;re all caught up. Updates on lots you watch or bid on will appear here.
                        </p>
                    ) : (
                        <ul>
                            {items.map((n, i) => {
                                const meta = KIND_META[n.kind];
                                const Icon = meta.icon;

                                return (
                                    <li key={n.id} className={cn(i !== 0 && "border-t border-border")}>
                                        <Link
                                            href={`/auctions/${n.auctionId}`}
                                            onClick={close}
                                            className="flex gap-3.5 py-3.5 text-sm"
                                        >
                                            <span
                                                className={cn(
                                                    "mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full",
                                                    meta.tone
                                                )}
                                            >
                                                <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                                            </span>
                                            <p className="min-w-0 flex-1 leading-snug text-foreground">
                                                {n.message}
                                                <small className="mt-1 block text-xs tabular-nums text-muted-foreground">
                                                    {timeAgo(n.ts)}
                                                </small>
                                            </p>
                                            {!n.read && (
                                                <span
                                                    className="mt-2 h-2 w-2 flex-none rounded-full bg-primary"
                                                    aria-label="Unread"
                                                />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </>
    );
}
