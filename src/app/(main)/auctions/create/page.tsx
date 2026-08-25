// src/app/(main)/auctions/create/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * SELL AN ITEM — CREATION WIZARD
 * Five earned steps: Item → Images → Details → Schedule → Review.
 * Validation is per-step (fail fast, recover locally); the server remains
 * authoritative at publish. The same wizard serves EDIT mode for upcoming
 * lots via ?edit=<id> — one surface, two verbs.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { auctionsApi, AUCTION_CATEGORIES, type AuctionDraftPayload } from "@/lib/api/auctions";
import { formatMoney } from "@/lib/formatting/format";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StepIndicator } from "@/components/selling/StepIndicator";
import { ImageStudio } from "@/components/selling/ImageStudio";

const STEPS = ["Item", "Images", "Details", "Schedule", "Review"] as const;

/** Local draft: inputs stay strings; parsing happens at the boundary. */
interface Draft {
    title: string;
    category: string;
    description: string;
    images: string[];
    startingPrice: string;
    startTime: string; // datetime-local value
    endTime: string;
}

const EMPTY_DRAFT: Draft = {
    title: "",
    category: "",
    description: "",
    images: [],
    startingPrice: "",
    startTime: "",
    endTime: "",
};

export default function CreateAuctionPage() {
    // useSearchParams requires a Suspense boundary under static rendering.
    return (
        <Suspense fallback={<WizardSkeleton />}>
            <Wizard />
        </Suspense>
    );
}

function Wizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit"); // edit mode for upcoming lots
    const { isAuthenticated, isLoading: authLoading } = useAuthStore();

    /* ── Wizard state ────────────────────────────────────────────────────── */
    const [step, setStep] = useState(0);
    const [maxVisited, setMaxVisited] = useState(0);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [editLocked, setEditLocked] = useState(false); // non-upcoming lot

    const patch = (p: Partial<Draft>) => {
        setDraft((d) => ({ ...d, ...p }));
        setErrors({}); // editing is its own recovery
    };

    /* ── Edit mode: hydrate the draft once ───────────────────────────────── */
    useEffect(() => {
        if (!editId) return;
        auctionsApi.getById(editId).then((a) => {
            if (a.status !== "upcoming") {
                // Backend rule mirrored: live lots are not editable.
                setEditLocked(true);
                return;
            }
            setDraft({
                title: a.title ?? "",
                category: a.category ?? "",
                description: a.description ?? "",
                images: a.images ?? [],
                startingPrice: String(a.startingPrice ?? ""),
                startTime: a.startTime ? toLocalInput(a.startTime) : "",
                endTime: a.endTime ? toLocalInput(a.endTime) : "",
            });
            setMaxVisited(STEPS.length - 1); // revising sellers may jump freely
        }).catch(() => toast.error("Couldn't load the auction for editing"));
    }, [editId]);

    /* ── Per-step validation (client mirrors; server is authoritative) ───── */
    const validateStep = (s: number): Record<string, string> => {
        const e: Record<string, string> = {};

        if (s === 0) {
            if (draft.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
            if (!draft.category) e.category = "Choose a category.";
            if (draft.description.trim().length < 10) e.description = "Describe the lot in at least 10 characters.";
        }
        if (s === 1 && draft.images.length === 0) e.images = "Add at least one image.";
        if (s === 2) {
            const price = Number(draft.startingPrice);
            if (!Number.isFinite(price) || price <= 0) e.startingPrice = "Starting price must be a positive number.";
        }
        if (s === 3) {
            const start = draft.startTime ? new Date(draft.startTime) : null;
            const end = draft.endTime ? new Date(draft.endTime) : null;
            if (!end || Number.isNaN(end.getTime())) e.endTime = "Set an end time.";
            else if (end.getTime() <= Date.now()) e.endTime = "End time must be in the future.";
            if (start && end && start.getTime() >= end.getTime()) e.startTime = "Start must be before end.";
        }
        return e;
    };

    const next = () => {
        const e = validateStep(step);
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }
        const target = Math.min(step + 1, STEPS.length - 1);
        setStep(target);
        setMaxVisited((m) => Math.max(m, target));
    };

    /* ── Publish / Save ──────────────────────────────────────────────────── */
    const publish = async () => {
        // Re-validate everything at the gate — never trust the path taken.
        for (let s = 0; s < 4; s++) {
            const e = validateStep(s);
            if (Object.keys(e).length > 0) {
                setErrors(e);
                setStep(s);
                return;
            }
        }

        const payload: AuctionDraftPayload = {
            title: draft.title.trim(),
            category: draft.category,
            description: draft.description.trim(),
            images: draft.images,
            startingPrice: Number(draft.startingPrice),
            startTime: draft.startTime ? new Date(draft.startTime).toISOString() : undefined,
            endTime: new Date(draft.endTime).toISOString(),
        };

        setSubmitting(true);
        try {
            if (editId) {
                const updated = await auctionsApi.update(editId, payload);
                toast.success("Auction updated");
                router.push(`/auctions/${updated._id}`);
            } else {
                const created = await auctionsApi.create(payload);
                toast.success("Your lot is live on the floor");
                router.push(`/auctions/${created._id}`);
            }
        } catch {
            toast.error(editId ? "Couldn't update the auction" : "Couldn't publish the auction");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Guards ──────────────────────────────────────────────────────────── */
    if (authLoading) return <WizardSkeleton />;
    if (!isAuthenticated) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20">
                <EmptyState
                    title="Sign in to sell"
                    description="Listings are tied to a verified seller account."
                    action={<Button size="sm" asChild><a href="/login">Sign In</a></Button>}
                />
            </div>
        );
    }
    if (editLocked) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20">
                <EmptyState
                    title="This lot can no longer be edited"
                    description="Bidding has started. Live auctions are locked to protect bidders."
                    action={<Button variant="outline" size="sm" asChild><a href="/account/selling">Back to Selling</a></Button>}
                />
            </div>
        );
    }

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 md:px-8">
            <SectionHeading
                overline={editId ? "Revise your lot" : "Consign to the house"}
                title={editId ? "Edit Auction" : "Sell an Item"}
            />

            <StepIndicator
                steps={[...STEPS]}
                current={step}
                maxVisited={maxVisited}
                onStepClick={setStep}
            />

            <div className="space-y-6 border border-border bg-card p-6">
                {step === 0 && <StepItem draft={draft} errors={errors} patch={patch} />}
                {step === 1 && (
                    <div className="space-y-2">
                        <ImageStudio
                            images={draft.images}
                            onAdd={(url) => setDraft((d) => ({ ...d, images: [...d.images, url] }))}
                            onRemove={(url) => setDraft((d) => ({ ...d, images: d.images.filter((i) => i !== url) }))}
                        />
                        {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
                    </div>
                )}
                {step === 2 && <StepDetails draft={draft} errors={errors} patch={patch} />}
                {step === 3 && <StepSchedule draft={draft} errors={errors} patch={patch} />}
                {step === 4 && <Review draft={draft} onEdit={setStep} />}
            </div>

            {/* ── Wizard navigation ── */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
                    Back
                </Button>

                {step < STEPS.length - 1 ? (
                    <Button onClick={next}>Continue</Button>
                ) : (
                    <Button onClick={publish} loading={submitting}>
                        {editId ? "Save Changes" : "Publish Auction"}
                    </Button>
                )}
            </div>
        </div>
    );
}

/* ── Step bodies ─────────────────────────────────────────────────────────── */

interface StepProps {
    draft: Draft;
    errors: Record<string, string>;
    patch: (p: Partial<Draft>) => void;
}

function StepItem({ draft, errors, patch }: StepProps) {
    return (
        <div className="space-y-5">
            <Field label="Title" htmlFor="title" error={errors.title}>
                <Input id="title" value={draft.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Vintage Omega Seamaster" />
            </Field>

            <Field label="Category" htmlFor="category" error={errors.category}>
                <select
                    id="category"
                    value={draft.category}
                    onChange={(e) => patch({ category: e.target.value })}
                    className="h-10 w-full rounded-sm border border-border bg-secondary/60 px-3 text-sm text-foreground focus-visible:border-primary/50 focus-visible:outline-none"
                >
                    <option value="">Select a category</option>
                    {AUCTION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </Field>

            <Field label="Description" htmlFor="description" error={errors.description} hint="Provenance, condition, story">
                <textarea
                    id="description"
                    value={draft.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    rows={5}
                    className="w-full rounded-sm border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground focus-visible:border-primary/50 focus-visible:outline-none"
                />
            </Field>
        </div>
    );
}

function StepDetails({ draft, errors, patch }: StepProps) {
    return (
        <div className="space-y-5">
            <Field label="Starting Price" htmlFor="price" error={errors.startingPrice} hint="USD, whole dollars">
                <Input
                    id="price"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={draft.startingPrice}
                    onChange={(e) => patch({ startingPrice: e.target.value })}
                    placeholder="5000"
                />
            </Field>
            <p className="text-xs leading-relaxed text-muted-foreground/70">
                Bids reserve funds from bidders' available balances while they lead.
                Settlement executes automatically when the hammer falls.
            </p>
        </div>
    );
}

function StepSchedule({ draft, errors, patch }: StepProps) {
    return (
        <div className="space-y-5">
            <Field label="Start Date (optional)" htmlFor="start" error={errors.startTime} hint="Leave empty to start immediately">
                <Input id="start" type="datetime-local" value={draft.startTime} onChange={(e) => patch({ startTime: e.target.value })} />
            </Field>
            <Field label="End Date" htmlFor="end" error={errors.endTime}>
                <Input id="end" type="datetime-local" value={draft.endTime} onChange={(e) => patch({ endTime: e.target.value })} />
            </Field>
        </div>
    );
}

/** Read-only summary with per-section edit jumps. */
function Review({ draft, onEdit }: { draft: Draft; onEdit: (step: number) => void }) {
    return (
        <div className="space-y-6">
            <ReviewRow label="Item" onEdit={() => onEdit(0)}>
                <p className="font-serif text-lg text-foreground">{draft.title}</p>
                <p className="text-xs text-muted-foreground">{draft.category}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{draft.description}</p>
            </ReviewRow>

            <ReviewRow label="Images" onEdit={() => onEdit(1)}>
                <div className="flex gap-2">
                    {draft.images.map((url, i) => (
                        <img key={url} src={url} alt={`Lot image ${i + 1}`} className="h-14 w-14 border border-border object-cover" />
                    ))}
                </div>
            </ReviewRow>

            <ReviewRow label="Details" onEdit={() => onEdit(2)}>
                <p className="text-sm tabular-nums text-primary">{formatMoney(Number(draft.startingPrice) || 0)} starting</p>
            </ReviewRow>

            <ReviewRow label="Schedule" onEdit={() => onEdit(3)}>
                <p className="text-sm text-foreground">
                    {draft.startTime ? `Starts ${new Date(draft.startTime).toLocaleString()}` : "Starts immediately"}
                </p>
                <p className="text-sm text-foreground">Ends {new Date(draft.endTime).toLocaleString()}</p>
            </ReviewRow>

            <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground/70">
                Ready to publish? Once live, the lot locks to protect bidders.
            </p>
        </div>
    );
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                <button type="button" onClick={onEdit} className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                    Edit
                </button>
            </div>
            {children}
        </div>
    );
}

/* ── Helpers & skeleton ──────────────────────────────────────────────────── */

/** ISO → datetime-local input value (local timezone, minute precision). */
function toLocalInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function WizardSkeleton() {
    return (
        <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 md:px-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}