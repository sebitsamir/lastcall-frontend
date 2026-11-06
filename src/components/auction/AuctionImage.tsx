"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import cloudinaryLoader from "@/lib/cloudinaryLoader";

interface AuctionImageProps {
    src?: string | null;
    alt: string;
    sizes?: string;
    eager?: boolean;
    className?: string;
    fallback?: "default" | "compact";
    fit?: "cover" | "contain";
    quality?: number;
}

export function AuctionImage({
    src,
    alt,
    sizes = "100vw",
    eager = false,
    className,
    fallback = "default",
    fit = "cover",
    quality = 75,
}: AuctionImageProps) {
    const normalizedSrc =
        typeof src === "string"
            ? src.trim()
            : "";

    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const failed = failedSrc === normalizedSrc;

    const isLocalImage = normalizedSrc.startsWith("/");

    const isCloudinaryImage = normalizedSrc.startsWith(
        "https://res.cloudinary.com/"
    );

    const validSource =
        normalizedSrc.length > 0 &&
        (isLocalImage || isCloudinaryImage);

    if (!validSource || failed) {
        return (
            <div
                className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    "bg-secondary text-muted-foreground/50"
                )}
                role={alt ? "img" : undefined}
                aria-label={alt || undefined}
                aria-hidden={!alt}
            >
                <div className="flex flex-col items-center gap-2">
                    <ImageOff
                        aria-hidden="true"
                        className={cn(
                            "stroke-[1.25]",
                            fallback === "compact"
                                ? "h-4 w-4"
                                : "h-6 w-6"
                        )}
                    />

                    {fallback === "default" && (
                        <span className="text-xs">
                            No image available
                        </span>
                    )}
                </div>
            </div>
        );
    }

    if (isCloudinaryImage) {
        return (
            <Image
                src={normalizedSrc}
                alt={alt}
                fill
                sizes={sizes}
                quality={quality}
                loader={cloudinaryLoader}
                priority={eager}
                loading={eager ? undefined : "lazy"}
                fetchPriority={eager ? "high" : "auto"}
                onError={() => {
                    setFailedSrc(normalizedSrc);
                }}
                className={cn(
                    fit === "contain" ? "object-contain" : "object-cover",
                    className
                )}
            />
        );
    }

    return (
            <Image
            src={normalizedSrc}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            priority={eager}
            loading={eager ? undefined : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            onError={() => {
                setFailedSrc(normalizedSrc);
            }}
            className={cn(
                fit === "contain" ? "object-contain" : "object-cover",
                className
            )}
        />
    );
}