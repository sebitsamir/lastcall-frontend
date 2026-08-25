// src/components/selling/ImageStudio.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * IMAGE STUDIO
 * Drag-and-drop (or browse) uploader with hard client mirrors of the server
 * rules: 5 images max, 5MB max, image types only. Uploads start immediately
 * on drop; tiles show their own loading state; the first image is the cover.
 * Removal is instant; a failed upload explains itself via toast.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { uploadsApi, UPLOAD_LIMITS } from "@/lib/api/uploads";
import { cn } from "@/lib/utils";

interface ImageStudioProps {
    images: string[];
    onAdd: (url: string) => void;     // parent uses functional setState
    onRemove: (url: string) => void;
}

export function ImageStudio({ images, onAdd, onRemove }: ImageStudioProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(0);   // in-flight count → ghost tiles
    const [dragActive, setDragActive] = useState(false);

    const slotsLeft = UPLOAD_LIMITS.maxImages - images.length - uploading;

    /* ── Validation mirrors (server remains authoritative) ───────────────── */
    const validate = (file: File): string | null => {
        if (!UPLOAD_LIMITS.accept.includes(file.type as (typeof UPLOAD_LIMITS.accept)[number]))
            return "Only JPG, PNG or WebP images are accepted.";
        if (file.size > UPLOAD_LIMITS.maxBytes) return "Images must be under 5MB.";
        return null;
    };

    /* ── Ingest files: validate → upload → append ────────────────────────── */
    const handleFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList);

        if (files.length > slotsLeft) {
            toast.error(`Up to ${UPLOAD_LIMITS.maxImages} images — ${slotsLeft} slot(s) left.`);
        }

        // Respect remaining slots; never queue beyond the cap.
        for (const file of files.slice(0, Math.max(0, slotsLeft))) {
            const problem = validate(file);
            if (problem) {
                toast.error(problem);
                continue;
            }

            setUploading((n) => n + 1);
            try {
                const url = await uploadsApi.uploadImage(file);
                onAdd(url);
            } catch {
                toast.error(`Couldn't upload ${file.name}`);
            } finally {
                setUploading((n) => n - 1);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* ── Dropzone: dashed, honest, keyboard-accessible via button ── */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    void handleFiles(e.dataTransfer.files);
                }}
                className={cn(
                    "flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-border bg-card/40"
                )}
            >
                <ImagePlus className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                <div>
                    <p className="text-sm text-foreground">Drag images here</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Up to {UPLOAD_LIMITS.maxImages} images · JPG/PNG/WebP · 5MB max
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                    Browse files
                </button>

                {/* Hidden native input: accessibility + mobile file pickers for free */}
                <input
                    ref={inputRef}
                    type="file"
                    accept={UPLOAD_LIMITS.accept.join(",")}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) void handleFiles(e.target.files);
                        e.target.value = ""; // allow re-selecting the same file later
                    }}
                />
            </div>

            {/* ── Tiles: cover first, ghosts for in-flight uploads ── */}
            {(images.length > 0 || uploading > 0) && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {images.map((url, i) => (
                        <div key={url} className="group relative aspect-square overflow-hidden border border-border bg-secondary">
                            <img src={url} alt={`Lot image ${i + 1}`} className="h-full w-full object-cover" />

                            {/* The first image leads everywhere — say so */}
                            {i === 0 && (
                                <span className="absolute left-1.5 top-1.5 border border-primary/40 bg-background/80 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] text-primary">
                                    Cover
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => onRemove(url)}
                                aria-label="Remove image"
                                className="absolute right-1.5 top-1.5 border border-border bg-background/80 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" strokeWidth={1.5} />
                            </button>
                        </div>
                    ))}

                    {/* Ghost tiles: the upload is visible, not a mystery spinner */}
                    {Array.from({ length: uploading }, (_, i) => (
                        <div key={`ghost-${i}`} className="flex aspect-square items-center justify-center border border-border bg-secondary">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={1.5} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}