"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

/** Below-the-fold entrance. Once, short, no bounce. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-64px" }}
            transition={{ duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] }}
        >
            {children}
        </motion.div>
    );
}
