import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background animate-fade-up">
            <div className="w-full max-w-md space-y-8">

                {/* Header - Clean, solid typography, no gradients */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-6">
                        <Logo size="lg" href="/" />
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
                        Welcome to <span className="text-gold">LastCall</span>
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Enter your details to get started with LastCall
                    </p>
                </div>

                {/* Form Card - Sharp, clean borders, no heavy shadows */}
                <div className="border border-border bg-card rounded-xl p-8">
                    <RegisterForm />
                </div>

                {/* Footer Link - Crisp hover state */}
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-gold hover:text-amber-400 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}