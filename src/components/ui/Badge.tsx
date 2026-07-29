// src/components/ui/Badge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
    default: "bg-primary-100 text-primary-900",
    success: "bg-emerald-100 text-emerald-800",
    destructive: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
};

type BadgeVariant = keyof typeof badgeVariants;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                badgeVariants[variant],
                className
            )}
            {...props}
        />
    );
}