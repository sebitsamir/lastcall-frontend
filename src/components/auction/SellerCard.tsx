/**
 * SELLER CARD
 * Trust without noise: identity + verification signal. No "SECURE!!!"
 * plastering — one shield, one line, done.
 */
import { ShieldCheck } from "lucide-react";

interface SellerCardProps {
    name?: string;
}

export function SellerCard({ name }: SellerCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-card border border-border bg-card p-4">
            {/* Monogram avatar: no stock photography */}
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-base font-bold text-primary-text">
                {(name ?? "L").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                    {name ?? "Verified Seller"}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary-text" strokeWidth={1.7} />
                    Authenticated & verified
                </p>
            </div>
        </div>
    );
}
