// src/components/wallet/BalanceCard.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * BALANCE CARD
 * One number, stated with authority. Gold is reserved for liquid funds —
 * the number users act on. Reserved stays quiet; total stays neutral.
 * Values morph when they change (deposits, bids) instead of blinking.
 * ────────────────────────────────────────────────────────────────────────────
 */
import { Skeleton } from "@/components/ui/skeleton";
import { MorphingMoney } from "@/components/bidding/MorphingMoney";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
    label: string;
    value: number;
    tone?: "gold" | "default" | "muted";
    hint?: string;
    loading?: boolean;
}

export function BalanceCard({ label, value, tone = "default", hint, loading }: BalanceCardProps) {
    if (loading) {
        return (
            <div className="space-y-3 rounded-card border border-border bg-card p-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-28" />
            </div>
        );
    }

    // The liquid-funds card is the one gold surface on the page (design `.wal`).
    const gold = tone === "gold";

    return (
        <div
            className={cn(
                "space-y-2 rounded-card p-5",
                gold ? "bg-primary text-primary-foreground" : "border border-border bg-card"
            )}
        >
            <p className={cn("text-xs font-medium", gold ? "opacity-75" : "text-muted-foreground")}>
                {label}
            </p>

            <MorphingMoney
                value={value}
                className={cn(
                    "text-2xl font-bold tracking-[-0.03em] md:text-3xl",
                    tone === "default" && "text-foreground",
                    tone === "muted" && "text-muted-foreground"
                )}
            />

            {hint && (
                <p className={cn("text-xs leading-relaxed", gold ? "opacity-75" : "text-muted-foreground")}>
                    {hint}
                </p>
            )}
        </div>
    );
}
