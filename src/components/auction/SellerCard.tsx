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
        <div className="flex items-center gap-4 border border-border bg-card p-4">
            {/* Monogram avatar: sharp, editorial, no stock photography */}
            <div className="flex h-11 w-11 items-center justify-center border border-border bg-secondary font-serif text-lg text-foreground">
                {(name ?? "L").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                    {name ?? "Verified Seller"}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                    Authenticated & verified
                </p>
            </div>
        </div>
    );
}