import { AuthScreen, AUTH_TRUST } from "@/components/auth/AuthScreen";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <AuthScreen
            badge="The auction house"
            brandTitle={
                <>
                    The marketplace moves{" "}
                    <em className="font-serif text-[1.08em] font-normal italic tracking-[-0.01em] text-gold">
                        in real time.
                    </em>
                </>
            }
            brandCopy="Sign in to track lots, place bids, and manage your collection."
            trust={[...AUTH_TRUST.login]}
            heading="Welcome back"
            subheading="Sign in to bid and manage your account."
            switchHref="/register"
            switchPrompt="New to the house?"
            switchLabel="Create an account"
        >
            <LoginForm />
        </AuthScreen>
    );
}
