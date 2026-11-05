import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
