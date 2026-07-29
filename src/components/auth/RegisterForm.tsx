"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerSchema, RegisterValues } from "@/lib/validators";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

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
            router.push("/");
        }
        catch (err: any) {
            setError(err.response?.data?.message || "Registration failed.");
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                    Create an Account
                </CardTitle>
                <CardDescription>
                    Enter your details to get started with LastCall
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" {...register("name")} />
                        {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input id="reg-email" type="email" placeholder="you@example.com" {...register("email")} />
                        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input id="reg-password" type="password" placeholder="••••••••" {...register("password")} />
                        {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-danger/10 text-danger text-sm text-center">
                            {error}
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
