"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Dark is LastCall's home theme; light is opt-in via the header toggle.
 * `attribute="class"` puts `.light` / `.dark` on <html>, which the token
 * layer in globals.css keys off. System preference is intentionally ignored
 * so the first paint always matches the brand.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            themes={["dark", "light"]}
            enableSystem={false}
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}
