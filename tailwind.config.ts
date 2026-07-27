import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary: Refined Royal Indigo (Trust, Action, Premium)
                primary: {
                    50: "#EEF2FF",
                    100: "#E0E7FF",
                    500: "#6366F1", // Used for subtle accents
                    600: "#4F46E5", // Main brand color (Buttons, Links)
                    700: "#4338CA", // Hover states
                    900: "#312E81", // Deep text/headers
                },
                // Neutrals: Slate (Sophisticated, reduces eye strain compared to pure gray)
                slate: {
                    50: "#F8FAFC",  // App background
                    100: "#F1F5F9", // Card backgrounds
                    200: "#E2E8F0", // Borders
                    400: "#94A3B8", // Disabled text/icons
                    600: "#475569", // Secondary text
                    800: "#1E293B", // Primary text
                    900: "#0F172A", // Headings (Softer than pure black)
                },
                // Semantic Colors (Crucial for UX feedback)
                success: {
                    DEFAULT: "#10B981", // Emerald (Wins, Completed, Positive balance)
                    dark: "#059669",
                },
                warning: {
                    DEFAULT: "#F59E0B", // Amber (Ending soon, Low balance)
                    dark: "#D97706",
                },
                danger: {
                    DEFAULT: "#EF4444", // Red (Outbid, Errors, Cancelled)
                    dark: "#DC2626",
                },
            },
            // Professional Gradients (Subtle, not overwhelming)
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #4F46E5 0%, #312E81 100%)',
                'brand-gradient-hover': 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                'surface-gradient': 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
            },
            // Professional Shadows (Soft, diffused, modern)
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
                'md': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
                'lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
                'glow': '0 0 15px rgba(79, 70, 229, 0.3)', // For primary buttons
            },
        },
    },
    plugins: [],
};
export default config;