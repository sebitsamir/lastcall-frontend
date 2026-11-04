"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FilterSheetProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

/**
 * Bottom sheet for the filter panel on small screens. Built on the native
 * <dialog> so focus trapping, Escape and the backdrop come from the browser.
 */
export function FilterSheet({ open, onClose, children }: FilterSheetProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-label="Filters"
            onClose={onClose}
            onClick={(event) => {
                // A click on the backdrop targets the <dialog> element itself.
                if (event.target === ref.current) onClose();
            }}
            className="fixed bottom-0 left-1/2 top-auto m-0 max-h-[88svh] w-full max-w-[560px] -translate-x-1/2 overflow-auto rounded-b-none rounded-t-[28px] border border-border bg-card p-0 text-foreground backdrop:bg-black/60"
        >
            <div className="p-[22px] pb-0 [&>div]:border-0 [&>div]:p-0">{children}</div>

            <div className="sticky bottom-0 mt-[22px] border-t border-border bg-card px-[22px] pb-[calc(14px+env(safe-area-inset-bottom,0px))] pt-3.5">
                <Button size="lg" className="w-full" onClick={onClose}>
                    Show results
                </Button>
            </div>
        </dialog>
    );
}
