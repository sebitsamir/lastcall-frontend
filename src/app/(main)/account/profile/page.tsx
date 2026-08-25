// src/app/(main)/account/profile/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * PROFILE PAGE
 * Identity surface: editable display name, read-only email (truthful — no
 * email-change endpoint exists), membership tenure.
 * After a successful rename we refetch /users/me so every surface (header,
 * bid history "You" detection, dashboard greeting) agrees immediately.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { usersApi } from "@/lib/api/users";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ProfilePage() {
    const { user, initializeAuth } = useAuthStore();

    const storedName = (user as { name?: string } | null)?.name ?? "";
    const email = (user as { email?: string } | null)?.email ?? "";
    const memberSince = (user as { createdAt?: string } | null)?.createdAt;

    /* ── Form state ──────────────────────────────────────────────────────── */
    const [name, setName] = useState(storedName);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // If the store refreshes (e.g. after save), keep the input in agreement.
    useEffect(() => {
        setName(storedName);
    }, [storedName]);

    const dirty = name.trim() !== storedName;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client mirror validation: fast feedback, server still authoritative.
        if (name.trim().length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }

        setError(null);
        setSaving(true);
        try {
            await usersApi.updateProfile({ name: name.trim() });
            toast.success("Profile updated");
            void initializeAuth(); // refetch /users/me → global agreement
        } catch {
            toast.error("Couldn't update your profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 md:px-8">
            <SectionHeading
                overline="Identity"
                title="Profile"
                description="How you appear across the house — bids, history and leaderboards."
            />

            <form onSubmit={submit} className="space-y-6 border border-border bg-card p-6">
                {/* Monogram + tenure: identity at a glance */}
                <div className="flex items-center gap-4 border-b border-border pb-6">
                    <div className="flex h-14 w-14 items-center justify-center border border-border bg-secondary font-serif text-2xl text-foreground">
                        {(storedName || "L").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-serif text-xl text-foreground">{storedName || "Collector"}</p>
                        {memberSince && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Member since {new Date(memberSince).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                <Field label="Display Name" htmlFor="name" error={error ?? undefined}>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError(null); // editing is its own recovery
                        }}
                        autoComplete="name"
                    />
                </Field>

                {/* Email is read-only because the backend owns it — say so plainly. */}
                <Field label="Email" hint="Managed by the house" htmlFor="email">
                    <Input id="email" value={email} disabled className="opacity-60" />
                </Field>

                <div className="flex justify-end">
                    <Button type="submit" loading={saving} disabled={!dirty || saving}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}