// src/app/(auth)/register/page.tsx
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm"; 

export default function RegisterPage() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* ══ LEFT: The Editorial Statement ══ */}
            <div className="relative hidden flex-col justify-between border-r border-border bg-[#050505] p-12 lg:flex">
                <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                    LAST<span className="text-primary">CALL</span>
                </Link>

                <div className="space-y-6 max-w-md">
                    <h2 className="font-serif text-4xl leading-tight text-foreground">
                        Join the house.
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Create your account to consign rare pieces, bid in real-time, and build your portfolio. Verification is required for all sellers.
                    </p>
                </div>

                <p className="text-xs text-muted-foreground/50">
                    © {new Date().getFullYear()} LastCall Auction House.
                </p>
            </div>

            {/* ══ RIGHT: The Functional Form ══ */}
            <div className="flex flex-1 items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile Logo */}
                    <div className="flex justify-center lg:hidden">
                        <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                            LAST<span className="text-primary">CALL</span>
                        </Link>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-serif text-3xl text-foreground">Create your account</h1>
                        <p className="text-sm text-muted-foreground">
                            Join the marketplace. It only takes a minute.
                        </p>
                    </div>

                    <RegisterForm />

                    <p className="text-center text-sm text-muted-foreground pt-4">
                        Already a member?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary transition-colors hover:text-accent"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}