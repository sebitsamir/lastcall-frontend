// src/app/page.tsx
"use client";

import { useAuthStore } from "@/store/authStore";

export default function Home() {
  // Let's test our Zustand store from Phase 2!
  const { isAuthenticated, user, isLoading } = useAuthStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
        
        {/* Test Phase 1: Brand Gradient & Typography */}
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-brand-gradient mb-4">
          LastCall
        </h1>
        
        <p className="text-slate-600 mb-8">
          Premium Auction Platform. Foundation successfully built.
        </p>

        {/* Test Phase 2: Zustand State & Conditional Rendering */}
        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Auth Store Status:
          </h2>
          
          {isLoading ? (
            <p className="text-slate-500">Checking authentication...</p>
          ) : isAuthenticated && user ? (
            <div>
              <p className="text-success-dark font-medium">
                Logged in as: {user.name}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Balance: ${user.availableBalance}
              </p>
            </div>
          ) : (
            <p className="text-slate-500">
              Not logged in. (We will build the login form in Phase 4)
            </p>
          )}
        </div>

      </div>
    </main>
  );
}