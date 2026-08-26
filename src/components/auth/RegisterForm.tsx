// src/components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function RegisterForm() {
    const router = useRouter();
    const initializeAuth = useAuthStore((s) => s.initializeAuth);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (name.trim().length < 2) e.name = "Name must be at least 2 characters.";
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email address.";
        if (password.length < 8) e.password = "Password must be at least 8 characters.";
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
            const { data } = await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim(),
                password,
            });

            // Some backends auto-login on register; handle both behaviors.
            const payload = ((data as Record<string, unknown>)?.data ?? data) as Record<string, unknown>;

            if (payload?.accessToken) {
                Cookies.set("accessToken", String(payload.accessToken));
                if (payload.refreshToken) Cookies.set("refreshToken", String(payload.refreshToken));
                await initializeAuth();
                toast.success("Welcome to the house. Your account is ready.");
                router.push("/account");
            } else {
                toast.success("Account created. Sign in to continue.");
                router.push("/login");
            }
        } catch (err) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setErrors({ form: msg ?? "Couldn't create your account. Try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <Field label="Full Name" htmlFor="reg-name" error={errors.name}>
                <Input
                    id="reg-name"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                />
            </Field>

            <Field label="Email" htmlFor="reg-email" error={errors.email}>
                <Input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                />
            </Field>

            <Field label="Password" htmlFor="reg-password" error={errors.password} hint="Min. 8 characters">
                <div className="relative">
                    <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
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
                Create Account
            </Button>
        </form>
    );
}