// src/components/wallet/TransactionList.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * TRANSACTION LIST
 * The ledger. Sign and color carry meaning at a glance:
 *   +  success green   (money in / released)
 *   −  neutral white   (reserved / spent)
 * Hairline rows, tabular amounts, relative time. No boxes per row.
 * ────────────────────────────────────────────────────────────────────────────
 */
import {
    ArrowDownToLine, Banknote, Hammer, Lock, RotateCcw, Unlock,
    type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatMoney, timeAgo } from "@/lib/formatting/format";
import type { ITransaction } from "@/lib/api/wallet";
import { cn } from "@/lib/utils";

/** Type → presentation map. Unknown types fail safe to a neutral row. */
const META: Record<string, { label: string; icon: LucideIcon; inflow: boolean }> = {
    deposit: { label: "Deposit", icon: ArrowDownToLine, inflow: true },
    bid_released: { label: "Bid released", icon: Unlock, inflow: true },
    refund: { label: "Refund", icon: RotateCcw, inflow: true },
    payout: { label: "Payout", icon: Banknote, inflow: true },
    bid_reserved: { label: "Bid reserved", icon: Lock, inflow: false },
    purchase: { label: "Purchase", icon: Hammer, inflow: false },
};

interface TransactionListProps {
    transactions: ITransaction[];
    loading?: boolean;
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
    if (loading) {
        return (
            <div className="space-y-0 divide-y divide-border border border-border bg-card">
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="h-9 w-9" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <EmptyState
                title="No activity yet"
                description="Deposits, bids and releases will appear here."
            />
        );
    }

    return (
        <ol className="divide-y divide-border border border-border bg-card">
            {transactions.map((tx) => {
                const meta = META[tx.type] ?? { label: tx.type, icon: Lock, inflow: false };
                const Icon = meta.icon;

                return (
                    <li key={tx._id} className="flex items-center gap-4 p-4">
                        {/* Type icon: quiet square, not a colored coin */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-secondary">
                            <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-foreground">{meta.label}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {tx.description || timeAgo(tx.createdAt)}
                            </p>
                        </div>

                        {/* Signed amount: inflow green, outflow neutral. Tabular always. */}
                        <span
                            className={cn(
                                "shrink-0 text-sm font-medium tabular-nums",
                                meta.inflow ? "text-success" : "text-foreground"
                            )}
                        >
                            {meta.inflow ? "+" : "−"}{formatMoney(tx.amount)}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}