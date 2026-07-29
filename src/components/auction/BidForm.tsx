// src/components/auction/BidForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { IAuction } from "@/types";
import { auctionService } from "@/services/auctionService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Gavel } from "lucide-react";

// 1. Dynamic Schema: The minimum bid depends on the current auction price
const createBidSchema = (currentBid: number) => z.object({
    amount: z.number().min(currentBid + 1, `Bid must be at least $${currentBid + 1}`),
});

interface BidFormProps {
    auction: IAuction;
    onBidPlaced: (newBid: number) => void; // Callback to update parent state
}

export function BidForm({ auction, onBidPlaced }: BidFormProps) {
    const { isAuthenticated } = useAuthStore();

    // We recreate the schema dynamically based on the current bid
    const bidSchema = createBidSchema(auction.currentBid);
    type BidValues = z.infer<typeof bidSchema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BidValues>({
        resolver: zodResolver(bidSchema),
        defaultValues: { amount: auction.currentBid + 1 },
    });

    const onSubmit = async (data: BidValues) => {
        if (!isAuthenticated) {
            toast.error("Please log in to place a bid.");
            return;
        }

        try {
            await auctionService.placeBid(auction._id, data.amount);
            toast.success("Bid placed successfully!");

            // Update the parent component's state immediately (Optimistic UI)
            onBidPlaced(data.amount);

            // Reset form to the new minimum bid
            reset({ amount: data.amount + 1 });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to place bid.");
        }
    };

    if (auction.status !== "active") {
        return (
            <div className="p-4 bg-slate-100 rounded-lg text-center text-slate-600 font-medium">
                This auction is {auction.status}.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="bid-amount">Your Bid (USD)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                        id="bid-amount"
                        type="number"
                        className="pl-7 text-lg font-semibold"
                        {...register("amount", { valueAsNumber: true })}
                    />
                </div>
                {errors.amount && (
                    <p className="text-sm text-danger">{errors.amount.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Gavel className="mr-2 h-4 w-4" />
                {isSubmitting ? "Placing Bid..." : "Place Bid"}
            </Button>
        </form>
    );
}