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
            <div className="space-y-3 border border-border bg-card p-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-28" />
            </div>
        );
    }

    return (
        <div className="space-y-2 border border-border bg-card p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {label}
            </p>

            <MorphingMoney
                value={value}
                className={cn(
                    "text-2xl font-medium md:text-3xl",
                    tone === "gold" && "text-primary",
                    tone === "default" && "text-foreground",
                    tone === "muted" && "text-muted-foreground"
                )}
            />

            {hint && <p className="text-xs leading-relaxed text-muted-foreground/70">{hint}</p>}
        </div>
    );
}