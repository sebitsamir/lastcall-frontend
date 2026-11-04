import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CreateAuctionLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
