import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
    label: string;
    hint?: string;
    error?: string;
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
}

export function Field({ label, hint, error, htmlFor, children, className }: FieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-baseline justify-between">
                <label htmlFor={htmlFor} className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    {label}
                </label>
                {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
            </div>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}