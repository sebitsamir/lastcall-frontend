// src/app/(main)/account/settings/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * SETTINGS PAGE
 * Honest surfaces only: account facts, the security model explained in
 * plain language (trust without plastering "SECURE" everywhere), and
 * session control. No fake toggles, no dead buttons.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { LogOut, ShieldCheck, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const email = (user as { email?: string } | null)?.email ?? "";
    const role = (user as { role?: string } | null)?.role ?? "member";

    return (
        <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 md:px-8">
            <SectionHeading overline="House rules" title="Settings" />

            {/* ── Account facts: hairline table, not cards ── */}
            <section className="divide-y divide-border border border-border bg-card">
                <SettingRow label="Email" value={email} />
                <SettingRow label="Role" value={role} />
            </section>

            {/* ── Security model, explained like a human ── */}
            <section className="space-y-4">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Security
                </h2>

                <div className="space-y-4 border border-border bg-card p-5">
                    <div className="flex gap-3">
                        <Lock className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Sessions use HttpOnly cookies — your tokens are never readable by
                            browser scripts.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Funds are reserved only while you lead a bid, and released
                            automatically when you're outbid or the lot closes.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Session control ── */}
            <section className="space-y-4">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Session
                </h2>
                <div className="flex items-center justify-between border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">Signed in as {email || "—"}</p>
                    <Button variant="destructive" size="sm" onClick={logout}>
                        <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Sign Out
                    </Button>
                </div>
            </section>
        </div>
    );
}

/** One hairline fact row. */
function SettingRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between p-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
            <span className="text-sm text-foreground">{value}</span>
        </div>
    );
}