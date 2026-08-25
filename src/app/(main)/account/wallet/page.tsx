// src/app/(main)/account/wallet/page.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * WALLET PAGE
 * The full ledger + buying power. Deposits refresh BOTH the auth store's
 * user (balances) and the ledger, so every surface stays in agreement.
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { walletApi, walletSnapshot, type TransactionPage } from "@/lib/api/wallet";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/auction/Pagination";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TransactionList } from "@/components/wallet/TransactionList";
import { AddFundsDialog } from "@/components/wallet/AddFundsDialog";

const PAGE_SIZE = 10;

export default function WalletPage() {
    const { user, initializeAuth } = useAuthStore();
    const wallet = walletSnapshot(user);

    const [page, setPage] = useState(1);
    const [data, setData] = useState<TransactionPage | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [dialogOpen, setDialogOpen] = useState(false);
    const requestId = useRef(0);

    const load = useCallback((p: number) => {
        const id = ++requestId.current;
        setStatus("loading");
        walletApi
            .getTransactions(p, PAGE_SIZE)
            .then((result) => {
                if (id !== requestId.current) return;
                setData(result);
                setStatus("ready");
            })
            .catch(() => {
                if (id !== requestId.current) return;
                setStatus("error");
            });
    }, []);

    useEffect(() => {
        load(page);
    }, [load, page]);

    /** After a deposit: fresh balances + fresh ledger, same page. */
    const handleDepositSuccess = () => {
        void initializeAuth();
        load(page);
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 md:px-8">
            <SectionHeading
                overline="Funds & ledger"
                title="Wallet"
                action={
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Add Funds
                    </Button>
                }
            />

            {/* ── Buying power, stated in three voices ── */}
            <div className="grid gap-4 md:grid-cols-3">
                <BalanceCard label="Available Balance" value={wallet.available} tone="gold" />
                <BalanceCard label="Reserved for Bids" value={wallet.frozen} tone="muted" />
                <BalanceCard label="Total Buying Power" value={wallet.total} />
            </div>

            {/* ── The ledger ── */}
            <section className="space-y-6">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Transactions
                </h2>

                {status === "error" ? (
                    <ErrorState
                        title="Couldn't load your ledger"
                        action={<Button variant="outline" size="sm" onClick={() => load(page)}>Retry</Button>}
                    />
                ) : (
                    <>
                        <TransactionList
                            transactions={data?.transactions ?? []}
                            loading={status === "loading"}
                        />
                        {data && (
                            <Pagination
                                page={data.pagination.page}
                                pages={data.pagination.pages}
                                onPageChange={setPage}
                                disabled={status === "loading"}
                            />
                        )}
                    </>
                )}
            </section>

            <AddFundsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleDepositSuccess}
            />
        </div>
    );
}