"use client";

import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Wallet, Shield } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuthStore();
    if (!user) return null;

    return (
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 space-y-10 animate-fade-up">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                        <User className="h-5 w-5 text-gold" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium">Account Settings</p>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Profile</h1>
                <p className="text-muted-foreground">Manage your account details and view your balance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Account Information */}
                <Card className="border-border bg-card">
                    <CardHeader className="pb-4">
                        <CardTitle className="font-display text-xl text-foreground flex items-center gap-2">
                            <Shield className="h-5 w-5 text-gold" /> Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: "Full Name", value: user.name },
                            { label: "Email Address", value: user.email },
                            { label: "Account Role", value: user.role || "User" },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                <span className="text-sm text-muted-foreground">{item.label}</span>
                                <span className="text-sm font-medium text-foreground">{item.value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant={user.isActive ? "default" : "destructive"} className="bg-gold/10 text-gold border-gold/20 hover:bg-gold/20">
                                {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Balance */}
                <Card className="border-border bg-card relative overflow-hidden">
                    {/* Subtle gold glow in corner */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

                    <CardHeader className="pb-4">
                        <CardTitle className="font-display text-xl text-foreground flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-gold" /> Wallet Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-xl bg-gradient-to-br from-gold/5 to-transparent border border-gold/10 p-6 text-center space-y-2">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Available Balance</p>
                            <p className="font-display text-4xl font-semibold text-gradient-gold">
                                ${user.availableBalance.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-secondary/30 border border-border p-6 text-center space-y-2">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Frozen in Auctions</p>
                            <p className="font-display text-2xl font-semibold text-foreground">
                                ${(user.frozenBalance || 0).toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}