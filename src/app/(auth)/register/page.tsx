import { AuthScreen, AUTH_TRUST } from "@/components/auth/AuthScreen";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <AuthScreen
            badge="Become a member"
            brandTitle={
                <>
                    Join the house.{" "}
                    <em className="font-serif text-[1.08em] font-normal italic tracking-[-0.01em] text-gold">
                        Bid with confidence.
                    </em>
                </>
            }
            brandCopy="Create an account to consign lots, bid in real time, and follow the floor."
            trust={[...AUTH_TRUST.register]}
            heading="Create your account"
            subheading="Join in a minute. Bid as soon as you are in."
            switchHref="/login"
            switchPrompt="Already a member?"
            switchLabel="Sign in"
        >
            <RegisterForm />
        </AuthScreen>
    );
}
