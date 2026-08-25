import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function ErrorState({ title = "Something went wrong", description, action, className }: ErrorStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center rounded-sm border border-destructive/30 bg-destructive/5 px-6 py-16 text-center", className)}>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-destructive/30 bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-xl text-foreground">{title}</h3>
            {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}