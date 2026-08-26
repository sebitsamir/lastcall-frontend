// src/app/(auth)/login/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * LOGIN — SPLIT-SCREEN AUTH
 * Left: editorial brand statement with trust mechanics (desktop only).
 * Right: functional form, generous whitespace, sharp hierarchy.
 * Mobile: left panel hides; brand collapses to a centered wordmark.
 * ────────────────────────────────────────────────────────────────────────────
 */
import Link from "next/link";
import { Gavel, Lock, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
            {/* ══ LEFT: editorial statement + trust mechanics ══ */}
            <div className="relative hidden flex-col justify-between border-r border-border bg-[#050505] p-12 lg:flex">
                <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                    LAST<span className="text-primary">CALL</span>
                </Link>

                <div className="max-w-md space-y-10">
                    <div className="space-y-6">
                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                            The Auction House
                        </p>
                        <h2 className="font-serif text-5xl leading-[1.08] text-foreground">
                            The marketplace moves in real time.
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Rare objects. Real competition. One final bid. Sign in to track
                            lots, place bids, and manage your collection.
                        </p>
                    </div>

                    {/* Trust mechanics: hairline rows, not cards */}
                    <ul className="divide-y divide-border border-y border-border">
                        <TrustRow icon={Gavel} text="Real-time bidding with live outbid alerts" />
                        <TrustRow icon={Lock} text="Funds reserved only while you lead" />
                        <TrustRow icon={ShieldCheck} text="Verified sellers and authenticated lots" />
                    </ul>
                </div>

                <p className="text-xs text-muted-foreground/50">
                    © {new Date().getFullYear()} LastCall Auction House.
                </p>
            </div>

            {/* ══ RIGHT: the functional form ══ */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
                <div className="w-full max-w-sm space-y-10">
                    {/* Mobile-only brand */}
                    <div className="flex justify-center lg:hidden">
                        <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                            LAST<span className="text-primary">CALL</span>
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                            Member Access
                        </p>
                        <h1 className="font-serif text-4xl text-foreground">Welcome back</h1>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Sign in to access your account and active bids.
                        </p>
                    </div>

                    <LoginForm />

                    <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
                        New to the house?{" "}
                        <Link href="/register" className="font-medium text-primary transition-colors hover:text-accent">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

/** One hairline trust row for the left panel. */
function TrustRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
    return (
        <li className="flex items-center gap-3 py-3.5">
            <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">{text}</span>
        </li>
    );
}