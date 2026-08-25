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
            <div className="space-y-2">
                {overline && <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">{overline}</p>}
                <h2 className="font-serif text-2xl text-foreground md:text-3xl">{title}</h2>
                {description && <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}