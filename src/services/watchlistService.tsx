// src/services/watchlistService.ts
import api from "@/lib/api";
import { IApiResponse, IAuction } from "@/types";

export const watchlistService = {
    toggle: async (auctionId: string) => {
        const response = await api.post<IApiResponse<{ isWatching: boolean }>>(
            `/users/watchlist/${auctionId}`
        );
        return response.data.data;
    },

    getMyWatchlist: async () => {
        const response = await api.get<IApiResponse<IAuction[]>>("/users/watchlist");
        return response.data.data;
    },
};