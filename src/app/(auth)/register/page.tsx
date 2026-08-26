// src/app/(auth)/register/page.tsx
import Link from "next/link";
import { Gavel, Lock, ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
            {/* ══ LEFT: editorial statement + trust mechanics (desktop) ══ */}
            <div className="relative hidden flex-col justify-between border-r border-border bg-[#050505] p-12 lg:flex">
                <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                    LAST<span className="text-primary">CALL</span>
                </Link>

                <div className="max-w-md space-y-10">
                    <div className="space-y-6">
                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                            Become a Member
                        </p>
                        <h2 className="font-serif text-5xl leading-[1.08] text-foreground">
                            Join the house.
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Create your account to consign rare pieces, bid in real-time, and
                            build your portfolio.
                        </p>
                    </div>

                    {/* Trust mechanics: hairline rows, not cards */}
                    <ul className="divide-y divide-border border-y border-border">
                        <TrustRow icon={Gavel} text="Bid live on verified lots worldwide" />
                        <TrustRow icon={Lock} text="Escrow-protected balances, always" />
                        <TrustRow icon={ShieldCheck} text="Seller verification for every consignment" />
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
                            Become a Member
                        </p>
                        <h1 className="font-serif text-4xl text-foreground">Create your account</h1>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Join the marketplace. It only takes a minute.
                        </p>
                    </div>

                    <RegisterForm />

                    <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
                        Already a member?{" "}
                        <Link href="/login" className="font-medium text-primary transition-colors hover:text-accent">
                            Sign in
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