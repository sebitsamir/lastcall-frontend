"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { loginSchema, LoginValues } from "@/lib/validators";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginForm() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginValues) => {
        setError(null);
        try {
            // Login and get user data
            const { User } = await authService.login(data);

            // CRITICAL: Set the auth state in Zustand store
            setAuth(User);

            // Show success message
            toast.success(`Welcome back, ${User.name}!`);

            // Redirect to auctions
            router.push("/auctions");

        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed.");
            toast.error("Invalid credentials. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="bg-background border-border"
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="bg-background border-border"
                />
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-12 bg-gold text-background font-semibold hover:bg-amber-400 transition-colors"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    );
}