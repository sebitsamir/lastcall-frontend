"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginSchema, LoginValues } from "@/lib/validators";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

export function LoginForm() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState<string | null>(null);

    // 1. Initialize the form with Zod validation
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // 2. Handle Form Submission
    const onSubmit = async (data: LoginValues) => {
        setError(null);
        try {
            // Call the service
            const { user } = await authService.login(data);

            // Update global state (Zustand)
            setAuth(user);

            // Redirect to home/dashboard
            router.push("/");
        }
        catch (err: any) {
            // Handle backend errors ("Invalid credentials")
            setError(err.response?.data?.message || "An error occurred during loin.");
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                    Welcome Back
                </CardTitle>
                <CardDescription>
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email")} // Connects input to React Hook Form
                        />
                        {errors.email && (
                            <p className="text-xs text-danger">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-xs text-danger">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Global Error Message */}
                    {error && (
                        <div className="p-3 rounded-md bg-danger/10 text-danger text-sm text-center">
                            {error}
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting} // Disables button while loading
                    >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}