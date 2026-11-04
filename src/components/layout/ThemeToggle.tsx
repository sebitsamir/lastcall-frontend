"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Both icons are rendered and swapped with the `dark:` variant, so the
 * server and client markup are identical — no mounted-flag, no hydration flash.
 */
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
            <Sun className="hidden h-5 w-5 dark:block" strokeWidth={1.7} aria-hidden="true" />
            <Moon className="h-5 w-5 dark:hidden" strokeWidth={1.7} aria-hidden="true" />
        </button>
    );
}
