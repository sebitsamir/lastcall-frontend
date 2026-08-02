import api from "@/lib/api";
import { IApiResponse, IAuction } from "@/types";

// 1. Define the shape of our filter parameters
export interface AuctionFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "endingSoon" | "priceLow" | "priceHigh" | "newest";
    search?: string;
}

export const auctionService = {
    // 2. Fetch auctions with bulletproof data extraction
    getActiveAuctions: async (filters?: AuctionFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    params.append(key, value.toString());
                }
            });
        }

        const response = await api.get(`/auctions?${params.toString()}`);

        // The backend wraps everything in response.data.data
        const responseData = response.data.data;

        // SAFETY CHECK 1: If backend is returning the new paginated structure { auctions: [], pagination: {} }
        if (responseData && responseData.auctions && Array.isArray(responseData.auctions)) {
            return responseData.auctions;
        }

        // SAFETY CHECK 2: If backend is still returning the old flat array structure []
        if (Array.isArray(responseData)) {
            return responseData;
        }

        // SAFETY CHECK 3: Fallback to empty array if something is totally wrong to prevent .map() crashes
        console.warn("Unexpected response format from /auctions:", responseData);
        return [];
    },

    // 3. Fetch a single auction by ID
    getAuctionById: async (id: string) => {
        const response = await api.get<IApiResponse<IAuction>>(`/auctions/${id}`);
        return response.data.data;
    },

    // 4. Place a bid
    placeBid: async (auctionId: string, amount: number) => {
        const response = await api.post<IApiResponse<any>>(`/auctions/${auctionId}/bid`, {
            amount,
        });
        return response.data;
    },
};