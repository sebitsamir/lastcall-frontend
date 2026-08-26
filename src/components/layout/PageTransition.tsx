// src/components/layout/PageTransition.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * PAGE TRANSITION
 * Subtle opacity + vertical drift on every route change, per the motion
 * doctrine: motion communicates state, it never decorates.
 * Keyed by pathname so each navigation remounts and animates exactly once.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <motion.div
            key={pathname} // new route → new element → enter animation
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}