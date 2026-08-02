"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { registerSchema, RegisterValues } from "@/lib/validators";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function RegisterForm() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onSubmit = async (data: RegisterValues) => {
        setError(null);
        try {
            const { user } = await authService.register(data);
            setAuth(user);
            toast.success("Account created successfully!");
            router.push("/auctions");
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Registration failed.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Full Name
                </Label>
                <Input
                    id="name"
                    placeholder="John Doe"
                    {...register("name")}
                    className="bg-background border-border focus:border-gold/50 focus:ring-gold/20"
                />
                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Email Address
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="bg-background border-border focus:border-gold/50 focus:ring-gold/20"
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Password
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="bg-background border-border focus:border-gold/50 focus:ring-gold/20"
                />
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-12 bg-gold text-background font-semibold hover:bg-amber-400 transition-colors"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
        </form>
    );
}