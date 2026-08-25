// src/components/auction/Pagination.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * PAGINATION
 * Minimal prev/next control with a tabular page indicator.
 * Hides itself when the result set fits on one page — pagination chrome
 * should never exist without a reason.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    page: number;
    pages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean; // disable while loading to avoid racing requests
}

export function Pagination({ page, pages, onPageChange, disabled }: PaginationProps) {
    // Single-page result sets don't need navigation chrome.
    if (pages <= 1) return null;

    return (
        <nav className="flex items-center justify-between border-t border-border pt-6" aria-label="Pagination">
            <Button
                variant="outline"
                size="sm"
                disabled={disabled || page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                Prev
            </Button>

            {/* tabular-nums keeps the indicator from shifting as digits change */}
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                Page {page} / {pages}
            </span>

            <Button
                variant="outline"
                size="sm"
                disabled={disabled || page >= pages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
        </nav>
    );
}