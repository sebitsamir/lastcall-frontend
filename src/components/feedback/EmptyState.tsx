import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-card/40 px-6 py-16 text-center", className)}>
            {Icon && (
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
            )}
            <h3 className="font-serif text-xl text-foreground">{title}</h3>
            {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}