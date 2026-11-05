import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    overline?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function SectionHeading({ overline, title, description, action, className }: SectionHeadingProps) {
    return (
        <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
            <div className="space-y-1.5">
                {overline && <p className="text-xs font-medium uppercase tracking-[0.12em] text-gold">{overline}</p>}
                <h2 className="text-[clamp(22px,2.4vw,28px)] font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
                {description && <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
