// src/components/selling/StepIndicator.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * STEP INDICATOR
 * Serif numerals, hairline connectors. Completed steps are clickable
 * (users revise); future steps are visible but inert — progress is earned,
 * never skipped. Gold marks the active step only.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
    steps: string[];
    current: number;      // active step index
    maxVisited: number;   // furthest validated step — the clickable boundary
    onStepClick: (index: number) => void;
}

export function StepIndicator({ steps, current, maxVisited, onStepClick }: StepIndicatorProps) {
    return (
        <ol className="flex items-center gap-3" aria-label="Progress">
            {steps.map((label, i) => {
                const isActive = i === current;
                const isDone = i < current;
                const isReachable = i <= maxVisited; // earned territory only

                return (
                    <li key={label} className="flex flex-1 items-center gap-3 last:flex-none">
                        <button
                            type="button"
                            disabled={!isReachable}
                            onClick={() => onStepClick(i)}
                            aria-current={isActive ? "step" : undefined}
                            className={cn(
                                "flex items-center gap-2 transition-colors",
                                isReachable ? "cursor-pointer" : "cursor-not-allowed"
                            )}
                        >
                            {/* Serif numeral: the step's identity */}
                            <span
                                className={cn(
                                    "font-serif text-lg tabular-nums",
                                    isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground/40"
                                )}
                            >
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                                className={cn(
                                    "hidden text-[10px] font-medium uppercase tracking-[0.2em] sm:block",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {label}
                            </span>
                        </button>

                        {/* Hairline connector between steps */}
                        {i < steps.length - 1 && (
                            <span className={cn("h-px flex-1", isDone ? "bg-primary/50" : "bg-border")} aria-hidden />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}