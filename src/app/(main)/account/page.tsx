// src/app/(main)/account/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * DASHBOARD
 * The authenticated home: money, positions, watch count, recent activity.
 * Data sources are independent — one failing must not blank the page,
 * so we settle them separately instead of Promise.all-or-die.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { walletApi, walletSnapshot, type ITransaction } from "@/lib/api/wallet";
import { watchlistApi } from "@/lib/api/watchlist";
import { greeting } from "@/lib/formatting/format";

import { SectionHeading } from "@/components/ui/section-heading";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TransactionList } from "@/components/wallet/TransactionList";
import { ActiveBids } from "@/components/account/ActiveBids";

import { useLogout } from "@/hooks/useLogout";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();

    const [watchCount, setWatchCount] = useState<number | null>(null);
    const [recent, setRecent] = useState<ITransaction[]>([]);
    const [ledgerLoading, setLedgerLoading] = useState(true);

    // Wallet numbers come straight from the auth store's user — no extra call.
    const wallet = walletSnapshot(user);

    const handleLogout = useLogout();

    /* Independent side-fetches: watch count + latest ledger entries. */
    useEffect(() => {
        if (!isAuthenticated) return;

        watchlistApi
            .list()
            .then((lots) => setWatchCount(lots.length))
            .catch(() => setWatchCount(0)); // quiet failure; the card shows 0

        walletApi
            .getTransactions(1, 5)
            .then((page) => setRecent(page.transactions))
            .catch(() => setRecent([]))
            .finally(() => setLedgerLoading(false));
    }, [isAuthenticated]);

    const firstName = ((user as { name?: string } | null)?.name ?? "").split(" ")[0];

    return (
        <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 pb-24 md:px-8">
            {/* Personal, time-aware greeting — the account feels inhabited */}
            <SectionHeading
                overline="Your activity at a glance"
                title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
            />

            {/* ── Money + watch position ── */}
            <div className="grid gap-4 md:grid-cols-3">
                <BalanceCard label="Available" value={wallet.available} tone="gold" hint="Liquid funds ready to bid" />
                <BalanceCard label="Reserved" value={wallet.frozen} tone="muted" hint="Held while you lead a bid" />

                {/* Watch count card: a count, not money — its own voice */}
                <div className="space-y-2 border border-border bg-card p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Watching
                    </p>
                    <p className="flex items-center gap-2 text-2xl font-medium tabular-nums text-foreground md:text-3xl">
                        <Eye className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                        {watchCount ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground/70">Lots on your watchlist</p>
                </div>
            </div>

            {/* ── Open positions ── */}
            <section className="space-y-4">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Your Active Bids
                </h2>
                <ActiveBids />
            </section>

            {/* ── Latest ledger movement ── */}
            <section className="space-y-4">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Recent Activity
                </h2>
                <TransactionList transactions={recent} loading={ledgerLoading} />
            </section>

            {/* ══ MOBILE-ONLY SIGN OUT BUTTON ══ */}
            <div className="mt-16 border-t border-border pt-8 md:hidden">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-sm border border-destructive/30 bg-destructive/5 py-4 text-sm font-medium uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}