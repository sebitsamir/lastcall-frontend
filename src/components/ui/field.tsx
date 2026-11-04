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
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={htmlFor} className="text-[13px] font-semibold text-muted-foreground">
                    {label}
                </label>
                {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
            {children}
            {error && <p className="text-[13px] text-destructive">{error}</p>}
        </div>
    );
}
