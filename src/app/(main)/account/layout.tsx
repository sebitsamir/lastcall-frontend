import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
