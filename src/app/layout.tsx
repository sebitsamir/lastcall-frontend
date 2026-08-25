import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Sophisticated serif for auction titles and editorial moments
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LastCall | Premium Auction Platform",
  description: "Bid, win, and settle auctions securely in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${instrument.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          {children}
          <AppShell>{children}</AppShell>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "hsl(0 0% 7%)",
                border: "1px solid hsl(0 0% 15%)",
                borderRadius: "2px",
                color: "hsl(60 15% 95%)",
                fontSize: "13px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

