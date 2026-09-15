"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { AuctionImage } from "@/components/auction/AuctionImage";

interface AuctionGalleryProps {
    images: string[];
    title: string;
}

export function AuctionGallery({
    images,
    title,
}: AuctionGalleryProps) {
    const [active, setActive] =
        useState(0);

    const cleanImages = images
        .filter(
            (image): image is string =>
                typeof image === "string"
        )
        .map((image) => image.trim())
        .filter(Boolean);

    if (cleanImages.length === 0) {
        return (
            <div
                className="
                    relative flex aspect-[4/3]
                    items-center justify-center
                    border border-border
                    bg-secondary
                    font-serif text-lg
                    text-muted-foreground/40
                "
            >
                No image available
            </div>
        );
    }

    const safeActive = Math.min(
        active,
        cleanImages.length - 1
    );

    return (
        <div className="space-y-2">
            <div
                className="
                    relative aspect-[4/3]
                    overflow-hidden
                    border border-border
                    bg-secondary
                "
            >
                <AuctionImage
                    src={cleanImages[safeActive]}
                    alt={`${title} — image ${
                        safeActive + 1
                    } of ${cleanImages.length}`}
                    eager={safeActive === 0}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
            </div>

            {cleanImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {cleanImages.map(
                        (src, index) => (
                            <button
                                key={`${src}-${index}`}
                                type="button"
                                onClick={() =>
                                    setActive(index)
                                }
                                aria-label={`View image ${
                                    index + 1
                                }`}
                                aria-current={
                                    index ===
                                    safeActive
                                }
                                className={cn(
                                    "relative aspect-square",
                                    "overflow-hidden border",
                                    "bg-secondary",
                                    "transition-colors",
                                    index ===
                                        safeActive
                                        ? "border-primary"
                                        : "border-border hover:border-muted-foreground/50"
                                )}
                            >
                                <AuctionImage
                                    src={src}
                                    alt=""
                                    sizes="120px"
                                    fallback="compact"
                                />
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}