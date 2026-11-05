"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { AuctionImage } from "@/components/auction/AuctionImage";

interface AuctionGalleryProps {
    images: string[];
    title: string;
    /** Absolutely-positioned controls (e.g. the watchlist heart) layered on the main image. */
    overlay?: React.ReactNode;
}

export function AuctionGallery({
    images,
    title,
    overlay,
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
                    rounded-[20px] border border-border
                    sm:rounded-hero
                    lg:aspect-square
                    bg-secondary
                    text-lg
                    text-muted-foreground/60
                "
            >
                No image available
                {overlay}
            </div>
        );
    }

    const safeActive = Math.min(
        active,
        cleanImages.length - 1
    );

    return (
        <div className="grid gap-3">
            <div
                className="
                    relative aspect-[4/3]
                    overflow-hidden
                    rounded-[20px] border border-border
                    bg-secondary
                    sm:rounded-hero
                    lg:aspect-square
                "
            >
                <AuctionImage
                    key={cleanImages[safeActive]}
                    src={cleanImages[safeActive]}
                    alt={`${title} — image ${
                        safeActive + 1
                    } of ${cleanImages.length}`}
                    eager={safeActive === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="animate-view-in"
                />
                {overlay}
            </div>

            {cleanImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
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
                                    "overflow-hidden rounded-2xl border-2",
                                    "bg-secondary",
                                    "transition-[opacity,border-color]",
                                    index ===
                                        safeActive
                                        ? "border-primary-text opacity-100"
                                        : "border-transparent opacity-70 hover:opacity-100"
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
