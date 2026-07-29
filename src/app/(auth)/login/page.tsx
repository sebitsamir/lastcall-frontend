import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="space-y-6">
            <LoginForm />

            <div className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary-600 font-medium hover:underline">
                    Create one
                </Link>
            </div>
        </div>
    )
}