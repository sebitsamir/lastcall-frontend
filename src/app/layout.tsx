// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider  } from "../components/providers/AuthProvider";// We will create this next

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LastCall | Premium Auction Platform",
  description: "Bid, win, and settle auctions securely in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        {/* We wrap the app in a provider to initialize the auth store */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}