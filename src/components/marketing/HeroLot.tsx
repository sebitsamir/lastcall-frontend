"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import type { IAuction } from "@/types";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/formatting/format";

import { StatusBadge } from "@/components/auction/StatusBadge";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { AuctionImage } from "@/components/auction/AuctionImage";

interface HeroLotProps {
    /** Most urgent live lots; the hero rotates through them. */
    auctions: IAuction[];
    className?: string;
}

/** Auto-advance cadence from the design. */
const ROTATE_MS = 6_500;

export function HeroLot({ auctions, className }: HeroLotProps) {
    const [index, setIndex] = useState(0);
    const count = auctions.length;

    useEffect(() => {
        if (count < 2) return;
        const id = setInterval(() => {
            if (!document.hidden) setIndex((i) => i + 1);
        }, ROTATE_MS);
        return () => clearInterval(id);
    }, [count]);

    if (count === 0) return null;

    const active = index % count;
    const auction = auctions[active];
    const displayBid = auction.currentBid ?? auction.startingPrice ?? 0;

    return (
        <div
            className={cn(
                "relative flex flex-col bg-secondary min-[900px]:block min-[900px]:min-h-[540px]",
                className
            )}
        >
            <div className="relative h-[240px] overflow-hidden min-[481px]:h-[clamp(230px,48vw,360px)] min-[900px]:absolute min-[900px]:inset-0 min-[900px]:h-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={auction._id}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                        <AuctionImage
                            src={auction.images?.[0]}
                            alt={auction.title}
                            eager
                            sizes="(min-width: 900px) 50vw, 100vw"
                            className="animate-ken-burns"
                        />
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                            aria-hidden="true"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {count > 1 && (
                <div className="absolute right-2.5 top-3.5 z-10 flex gap-1.5 min-[900px]:right-5 min-[900px]:top-5">
                    {auctions.map((item, i) => (
                        <button
                            key={item._id}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Featured lot ${i + 1}`}
                            aria-current={i === active}
                            className="grid h-11 w-9 place-items-center min-[900px]:h-7 min-[900px]:w-7"
                        >
                            <span
                                className={cn(
                                    "relative h-2 overflow-hidden rounded-full bg-white/40 transition-all duration-300",
                                    i === active ? "w-[22px]" : "w-2"
                                )}
                            >
                                {i === active && (
                                    <span
                                        key={index}
                                        className="animate-hero-progress absolute inset-y-0 left-0 rounded-full bg-white"
                                        style={{ animationDuration: `${ROTATE_MS}ms` }}
                                    />
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <Link
                href={`/auctions/${auction._id}`}
                aria-label={`View featured lot: ${auction.title}`}
                className="relative z-[2] m-4 block rounded-card border border-border bg-card/92 px-[18px] py-4 shadow-lift backdrop-blur-md min-[900px]:absolute min-[900px]:bottom-5 min-[900px]:left-5 min-[900px]:m-0 min-[900px]:w-[min(340px,calc(100%-40px))]"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={auction._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                        className="grid gap-2.5"
                    >
                        <StatusBadge
                            status={auction.status}
                            startTime={auction.startTime}
                            endTime={auction.endTime}
                            dot
                            className="w-fit"
                        />
                        <b className="line-clamp-2 text-base font-semibold">{auction.title}</b>
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground">Current bid</span>
                                <b className="block text-2xl font-[650] tracking-[-0.02em] tabular-nums text-primary-text">
                                    {formatMoney(displayBid)}
                                </b>
                            </div>
                            <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} icon className="text-sm" />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </Link>
        </div>
    );
}
