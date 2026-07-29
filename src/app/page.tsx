// src/app/page.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/Card";

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">

      {/* Using our new Compound Card Component */}
      <Card className="w-full max-w-md">

        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
            LastCall
          </CardTitle>
          <CardDescription>
            Phase 3: Design System & Compound Components
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Testing Input and Label */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button variant="default" className="w-full">
            Sign In
          </Button>

          <Button variant="outline" className="w-full">
            Create Account
          </Button>
        </CardFooter>

        {/* Zustand State Check */}
        <div className="px-6 pb-6 text-center border-t border-slate-100 pt-4">
          {isLoading ? (
            <p className="text-sm text-slate-400">Checking auth...</p>
          ) : isAuthenticated && user ? (
            <p className="text-sm text-success-dark font-medium">✅ Logged in as {user.name}</p>
          ) : (
            <p className="text-sm text-slate-400">👤 Not logged in</p>
          )}
        </div>

      </Card>
    </main>
  );
}