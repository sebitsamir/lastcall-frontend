"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Gavel } from "lucide-react";
import { IAuction } from "@/types";
import { auctionService } from "@/services/auctionService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const createBidSchema = (currentBid: number) => z.object({
    amount: z.number().min((currentBid || 0) + 1, `Bid must be at least $${(currentBid || 0) + 1}`),
});

interface BidFormProps {
    auction: IAuction;
    onBidPlaced: (newBid: number) => void;
}

export function BidForm({ auction, onBidPlaced }: BidFormProps) {
    const { isAuthenticated } = useAuthStore();
    const bidSchema = createBidSchema(auction.currentBid);
    type BidValues = z.infer<typeof bidSchema>;

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BidValues>({
        resolver: zodResolver(bidSchema),
        defaultValues: { amount: (auction.currentBid || 0) + 1 },
    });

    const onSubmit = async (data: BidValues) => {
        if (!isAuthenticated) { toast.error("Please log in to place a bid."); return; }
        try {
            await auctionService.placeBid(auction._id, data.amount);
            toast.success("Bid placed successfully!");
            onBidPlaced(data.amount);
            reset({ amount: data.amount + 1 });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to place bid.");
        }
    };

    if (auction.status !== "active") {
        return <div className="p-6 text-center text-muted-foreground border border-border rounded-lg bg-secondary/30">This auction is {auction.status}.</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="bid-amount" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Enter Your Maximum Bid
                </Label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-display font-semibold text-muted-foreground group-focus-within:text-gold transition-colors">$</span>
                    <Input
                        id="bid-amount"
                        type="number"
                        className="pl-10 h-14 text-2xl font-display font-semibold bg-background border-border focus:border-gold/50 focus:ring-gold/20 text-foreground transition-all"
                        {...register("amount", { valueAsNumber: true })}
                    />
                </div>
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                <p className="text-xs text-muted-foreground">
                    Minimum bid: <span className="text-foreground font-medium">${(auction.currentBid || 0) + 1}</span>
                </p>
            </div>

            <Button
                type="submit"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-gold to-amber-600 text-background hover:from-gold hover:to-amber-500 shadow-lg shadow-gold/20 transition-all"
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gavel className="h-5 w-5 mr-2" />}
                {isSubmitting ? "Processing..." : "Place Bid"}
            </Button>
        </form>
    );
}