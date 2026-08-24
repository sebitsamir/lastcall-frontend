import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#020617]">
                {/* Added pt-24 to clear the fixed navbar */}
                <main className="mx-auto max-w-7xl px-4 py-8 pt-28 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}