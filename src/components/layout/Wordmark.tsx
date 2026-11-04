import Link from "next/link";

import { cn } from "@/lib/utils";

interface WordmarkProps {
    href?: string;
    onClick?: () => void;
    className?: string;
}

/** The name is the mark — no icon tile, no image file. */
export function Wordmark({ href = "/", onClick, className }: WordmarkProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            aria-label="LastCall home"
            className={cn(
                "inline-flex items-baseline font-semibold leading-none tracking-[-0.035em] text-foreground",
                "text-[20px] sm:text-[22px]",
                className
            )}
        >
            <span className="text-gold">Last</span>
            <span>Call</span>
        </Link>
    );
}
