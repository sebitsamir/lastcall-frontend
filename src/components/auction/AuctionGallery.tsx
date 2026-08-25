/**
 * AUCTION GALLERY
 * Editorial photography first: one large plate, a hairline thumbnail rail.
 * No carousel library — state is a single index, motion is a quiet crossfade.
 * Thumbnails are real <button>s: keyboard-accessible for free.
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AuctionGalleryProps {
    images: string[];
    title: string; // Used for alt text — accessibility is not optional.
}

export function AuctionGallery({ images, title }: AuctionGalleryProps) {
    // Single source of truth for the visible plate.
    const [active, setActive] = useState(0);

    // Defensive: an auction may legally have zero images.
    if (images.length === 0) {
        return (
            <div className="flex aspect-[4/3] items-center justify-center border border-border bg-secondary font-serif text-lg text-muted-foreground/40">
                No image available
            </div>
        );
    }

    const safeActive = Math.min(active, images.length - 1);

    return (
        <div className="space-y-2">
            {/* ── Primary plate: generous, sharp, unhurried ── */}
            <div className="relative aspect-[4/3] overflow-hidden border border-border bg-secondary">
                <img
                    key={safeActive} // Key change remounts → clean crossfade per plate
                    src={images[safeActive]}
                    alt={`${title} — image ${safeActive + 1} of ${images.length}`}
                    loading="eager" // Flagship page: the hero image is the LCP element.
                    className="h-full w-full object-cover"
                />
            </div>

            {/* ── Thumbnail rail: only rendered when there is a choice to make ── */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {images.map((src, i) => (
                        <button
                            key={src}
                            onClick={() => setActive(i)}
                            aria-label={`View image ${i + 1}`}
                            aria-current={i === safeActive}
                            className={cn(
                                "aspect-square overflow-hidden border transition-colors",
                                i === safeActive
                                    ? "border-primary"          // Gold = "you are here"
                                    : "border-border hover:border-muted-foreground/50"
                            )}
                        >
                            <img
                                src={src}
                                alt="" // Decorative; the button carries the label.
                                loading="lazy"
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}