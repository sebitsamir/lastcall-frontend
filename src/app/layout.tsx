import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell";
import { MotionConfig } from "framer-motion";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Italic serif accent used for editorial emphasis (hero "Last call.")
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LastCall | Premium Auction Platform",
  description: "Bid, win, and settle auctions securely in real-time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: "#090909",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${instrument.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <AuthProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:border focus:border-primary focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
            >
              Skip to content
            </a>

            <MotionConfig reducedMotion="user">
              <AppShell>{children}</AppShell>
            </MotionConfig>

            <Toaster
              position="bottom-center"
              offset={24}
              mobileOffset={{ bottom: "calc(150px + env(safe-area-inset-bottom, 0px))" }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
