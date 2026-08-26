// src/app/(auth)/register/page.tsx
"use client"; // Add this to ensure client-side rendering

import Link from "next/link";
import { Gavel, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function RegisterPage() {
    const router = useRouter();
    const register = useAuthStore((s) => s.register);

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
            await register(name.trim(), email.trim(), password);
            toast.success("Welcome to the house. Your account is ready.");
            router.push("/account");
        } catch (err) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setErrors({ form: msg ?? "Couldn't create your account. Try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
            {/* ══ LEFT ══ */}
            <div className="relative hidden flex-col justify-between border-r border-border bg-[#050505] p-12 lg:flex">
                <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                    LAST<span className="text-primary">CALL</span>
                </Link>

                <div className="max-w-md space-y-10">
                    <div className="space-y-6">
                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                            Become a Member
                        </p>
                        <h2 className="font-serif text-5xl leading-[1.08] text-foreground">
                            Join the house.
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Create your account to consign rare pieces, bid in real-time, and
                            build your portfolio.
                        </p>
                    </div>

                    <ul className="divide-y divide-border border-y border-border">
                        <TrustRow icon={Gavel} text="Bid live on verified lots worldwide" />
                        <TrustRow icon={Lock} text="Escrow-protected balances, always" />
                        <TrustRow icon={ShieldCheck} text="Seller verification for every consignment" />
                    </ul>
                </div>

                <p className="text-xs text-muted-foreground/50">
                    © {new Date().getFullYear()} LastCall Auction House.
                </p>
            </div>

            {/* ══ RIGHT ═ */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
                <div className="w-full max-w-sm space-y-10">
                    <div className="flex justify-center lg:hidden">
                        <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                            LAST<span className="text-primary">CALL</span>
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                            Become a Member
                        </p>
                        <h1 className="font-serif text-4xl text-foreground">Create your account</h1>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Join the marketplace. It only takes a minute.
                        </p>
                    </div>

                    {/* Inline form instead of separate component */}
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

                    <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
                        Already a member?{" "}
                        <Link href="/login" className="font-medium text-primary transition-colors hover:text-accent">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

function TrustRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
    return (
        <li className="flex items-center gap-3 py-3.5">
            <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">{text}</span>
        </li>
    );
}