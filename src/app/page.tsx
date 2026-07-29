// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // 1. Show a loading state while Zustand checks the cookie
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // 2. DASHBOARD VIEW (If the user is logged in)
  if (isAuthenticated && user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
              Welcome back, {user.name}!
            </CardTitle>
            <CardDescription>
              You are successfully logged into LastCall.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600">
              Your current available balance is{" "}
              <span className="font-bold text-success-dark">${user.availableBalance.toFixed(2)}</span>.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={() => router.push("/auctions")}>
                Browse Auctions
              </Button>
              <Button variant="outline" onClick={() => router.push("/profile")}>
                My Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // 3. LANDING PAGE VIEW (If the user is a guest)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-brand-gradient">
            LastCall
          </CardTitle>
          <CardDescription className="text-lg">
            The premium real-time auction platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => router.push("/login")}>
            Sign In
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/register")}>
            Create an Account
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}