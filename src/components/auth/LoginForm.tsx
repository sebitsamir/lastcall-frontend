// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { reconnectSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function LoginForm() {
    const router = useRouter();
    const initializeAuth = useAuthStore((s) => s.initializeAuth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email address.";
        if (password.length < 1) e.password = "Password is required.";
        return e;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });

            const payload = ((data as Record<string, unknown>)?.data ?? data) as Record<string, unknown>;

            if (payload.accessToken) {
                // 1. Persist tokens
                Cookies.set("accessToken", String(payload.accessToken));
                if (payload.refreshToken) Cookies.set("refreshToken", String(payload.refreshToken));

                // 2. Reconnect socket with the new authenticated token
                reconnectSocket();

                // 3. Hydrate the store (fetches /users/me, flips isAuthenticated)
                await initializeAuth();

                toast.success("Welcome back to the house.");
                router.push("/auctions");
            } else {
                setErrors({ form: "Invalid response from server." });
            }
        } catch (err) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setErrors({ form: msg ?? "Invalid credentials. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <Field label="Email" htmlFor="login-email" error={errors.email}>
                <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                />
            </Field>

            <Field label="Password" htmlFor="login-password" error={errors.password}>
                <div className="relative">
                    <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                </div>
            </Field>

            {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
                Sign In
            </Button>
        </form>
    );
}