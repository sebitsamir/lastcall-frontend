/**
 * MORPHING MONEY
 * When the current bid changes in real time, the number rolls instead of
 * blinking. popLayout swaps old/new values vertically; tabular-nums keeps
 * widths stable so nothing shifts horizontally.
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatMoney } from "@/lib/formatting/format";
import { cn } from "@/lib/utils";

interface MorphingMoneyProps {
    value: number;
    className?: string;
}

export function MorphingMoney({ value, className }: MorphingMoneyProps) {
    return (
        <span className={cn("inline-flex overflow-hidden", className)}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={value} // New value → new element → enter/exit choreography
                    initial={{ y: "0.6em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-0.6em", opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="tabular-nums"
                >
                    {formatMoney(value)}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}