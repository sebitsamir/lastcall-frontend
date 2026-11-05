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
        <div className={cn("flex flex-col items-center justify-center rounded-panel border border-dashed border-border-strong px-5 py-16 text-center", className)}>
            {Icon && (
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.7} />
                </div>
            )}
            <h3 className="text-lg text-foreground">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
