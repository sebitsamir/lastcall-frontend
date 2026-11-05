import type { ReactNode } from "react";
import Link from "next/link";
import { Gavel, Lock, ShieldCheck, type LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/layout/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface TrustItem {
    icon: LucideIcon;
    text: string;
}

interface AuthScreenProps {
    badge: string;
    brandTitle: ReactNode;
    brandCopy: string;
    trust: TrustItem[];
    heading: string;
    subheading: string;
    children: ReactNode;
    switchHref: string;
    switchPrompt: string;
    switchLabel: string;
}

export function AuthScreen({
    badge,
    brandTitle,
    brandCopy,
    trust,
    heading,
    subheading,
    children,
    switchHref,
    switchPrompt,
    switchLabel,
}: AuthScreenProps) {
    return (
        <div className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
            <aside className="relative hidden min-h-svh flex-col justify-between overflow-hidden border-r border-border bg-card p-8 lg:flex xl:p-12">
                <div
                    className="pointer-events-none absolute -left-20 top-24 h-72 w-72 animate-gold-breathe rounded-full bg-[radial-gradient(circle,hsl(var(--gold)/0.16),transparent_70%)]"
                    aria-hidden="true"
                />
                <Wordmark />

                <div className="relative max-w-md space-y-8">
                    <div className="space-y-4">
                        <span className="inline-flex h-6 items-center rounded-full bg-primary/12 px-3 text-xs font-semibold text-primary-text">
                            {badge}
                        </span>
                        <h2 className="text-[clamp(32px,3.4vw,48px)] leading-[1.12] tracking-[-0.02em]">
                            {brandTitle}
                        </h2>
                        <p className="max-w-[42ch] text-base leading-relaxed text-muted-foreground">
                            {brandCopy}
                        </p>
                    </div>

                    <ul className="grid gap-3">
                        {trust.map((item) => (
                            <TrustRow key={item.text} icon={item.icon} text={item.text} />
                        ))}
                    </ul>
                </div>

                <p className="pt-8 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} LastCall Auction House.
                </p>
            </aside>

            <section className="relative flex min-h-svh flex-col">
                <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 lg:h-16 lg:justify-end lg:px-8">
                    <div className="lg:hidden">
                        <Wordmark />
                    </div>
                    <ThemeToggle />
                </header>

                <div className="flex flex-1 items-start justify-center px-4 pb-10 pt-2 sm:px-8 sm:pt-6 lg:items-center lg:px-12 lg:pb-16 xl:px-16">
                    <div className="animate-fade-up w-full max-w-[400px] space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-[clamp(26px,4vw,34px)] tracking-[-0.02em]">{heading}</h1>
                            <p className="text-base leading-relaxed text-muted-foreground">{subheading}</p>
                        </div>

                        {children}

                        <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
                            {switchPrompt}{" "}
                            <Link href={switchHref} className="font-semibold text-primary-text underline-offset-4 hover:underline">
                                {switchLabel}
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function TrustRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <li className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-xl bg-primary/12 text-primary-text">
                <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="text-sm text-muted-foreground">{text}</span>
        </li>
    );
}

export const AUTH_TRUST = {
    login: [
        { icon: Gavel, text: "Real-time bidding with live outbid alerts" },
        { icon: Lock, text: "Funds reserved only while you lead" },
        { icon: ShieldCheck, text: "Verified sellers and authenticated lots" },
    ],
    register: [
        { icon: Gavel, text: "Bid live on verified lots worldwide" },
        { icon: Lock, text: "Escrow-protected balances, always" },
        { icon: ShieldCheck, text: "Seller verification for every consignment" },
    ],
} as const;
