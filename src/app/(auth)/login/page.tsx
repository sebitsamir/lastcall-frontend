// src/app/(auth)/login/page.tsx
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* ══ LEFT: The Editorial Statement (Hidden on mobile) ══ */}
            <div className="relative hidden flex-col justify-between border-r border-border bg-[#050505] p-12 lg:flex">
                <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
                    LAST<span className="text-primary">CALL</span>
                </Link>

                <div className="space-y-6 max-w-md">
                    <h2 className="font-serif text-4xl leading-tight text-foreground">
                        The marketplace<br />moves in real time.
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Rare objects. Real competition. One final bid. Sign in to track lots, place bids, and manage your collection.
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
                        <h1 className="font-serif text-3xl text-foreground">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to access your account and active bids.
                        </p>
                    </div>

                    <LoginForm />

                    <p className="text-center text-sm text-muted-foreground pt-4">
                        New to the house?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-primary transition-colors hover:text-accent"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}