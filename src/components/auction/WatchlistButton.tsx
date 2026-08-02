"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { watchlistService } from "@/services/watchlistService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
    auctionId: string;
    initialIsWatching?: boolean;
    className?: string;
}

export function WatchlistButton({
    auctionId,
    initialIsWatching = false,
    className
}: WatchlistButtonProps) {
    const [isWatching, setIsWatching] = useState(initialIsWatching);
    const { isAuthenticated, user } = useAuthStore();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if user is authenticated FIRST
        if (!isAuthenticated || !user) {
            toast.error("Please log in to save auctions", {
                description: "You need to be logged in to use the watchlist feature.",
                action: {
                    label: "Sign In",
                    onClick: () => window.location.href = "/login",
                },
            });
            return;
        }

        const previousState = isWatching;
        setIsWatching(!previousState);

        try {
            await watchlistService.toggle(auctionId);
            toast.success(
                !previousState ? "Added to watchlist" : "Removed from watchlist"
            );
        } catch (error: any) {
            // Revert on error
            setIsWatching(previousState);

            // Show specific error message
            const errorMessage = error.response?.data?.message || "Failed to update watchlist";
            toast.error(errorMessage);
            console.error("Watchlist error:", error);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 border",
                isWatching
                    ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 shadow-[0_0_15px_rgba(248,113,113,0.3)]"
                    : "bg-black/40 text-muted-foreground border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10",
                className
            )}
            aria-label={isWatching ? "Remove from watchlist" : "Add to watchlist"}
        >
            <Heart className={cn("h-5 w-5 transition-transform duration-300", isWatching && "fill-current scale-110")} />
        </button>
    );
}