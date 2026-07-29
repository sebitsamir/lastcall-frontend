// src/app/(main)/profile/page.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge"; // We will create this next

export default function ProfilePage() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile</h1>
                <p className="text-slate-500">Manage your account details and view your balance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your personal details and account status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-sm font-medium text-slate-500">Full Name</span>
                            <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-sm font-medium text-slate-500">Email Address</span>
                            <span className="text-sm font-semibold text-slate-900">{user.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-sm font-medium text-slate-500">Account Role</span>
                            <span className="text-sm font-semibold text-slate-900 capitalize">{user.role}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-slate-500">Status</span>
                            <Badge variant={user.isActive ? "success" : "destructive"}>
                                {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Balance Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Balance</CardTitle>
                        <CardDescription>Your current available and frozen funds.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg bg-primary-50 p-6 text-center">
                            <p className="text-sm font-medium text-primary-900">Available Balance</p>
                            <p className="mt-2 text-4xl font-bold text-primary-600">
                                ${user.availableBalance.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-100 p-6 text-center">
                            <p className="text-sm font-medium text-slate-600">Frozen in Auctions</p>
                            <p className="mt-2 text-2xl font-bold text-slate-800">
                                ${user.frozenBalance.toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}