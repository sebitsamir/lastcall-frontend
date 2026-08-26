// src/hooks/usePageTitle.ts
/**
 * Client pages can't export Next metadata; this hook keeps the browser tab
 * honest ("Vintage Omega — LastCall" instead of "localhost:3000").
 * Restores the previous title on unmount so nested nav never leaks titles.
 */
import { useEffect } from "react";

export function usePageTitle(title: string) {
    useEffect(() => {
        const previous = document.title;
        document.title = title;
        return () => {
            document.title = previous;
        };
    }, [title]);
}