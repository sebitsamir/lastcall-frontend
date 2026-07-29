// src/services/auctionService.ts
import api from "@/lib/api";
import { IApiResponse, IAuction } from "@/types";

export const auctionService = {
    // Fetch all active auctions
    getActiveAuctions: async () => {
        const response = await api.get<IApiResponse<IAuction[]>>("/auctions");
        return response.data.data;
    },

    // Fetch a single auction by ID
    getAuctionById: async (id: string) => {
        const response = await api.get<IApiResponse<IAuction>>(`/auctions/${id}`);
        return response.data.data;
    },

    // Place a bid
    placeBid: async (auctionId: string, amount: number) => {
        const response = await api.post<IApiResponse<any>>(`/auctions/${auctionId}/bid`, {
            amount,
        });
        return response.data;
    },
};