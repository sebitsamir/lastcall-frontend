// 1. User Types (matches backend User.js)
export interface IUser {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role: "user" | "admin";
    availableBalance: number;
    frozenBalance?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    watchlist?: string[];
}

// 2. Auction Type (matches backend Auction.js)
export interface IAuction {
    _id: string;
    title: string;
    description: string;
    category: string;
    images: string[];
    startingPrice: number;
    currentBid: number;
    currentHighestBidder: number | IUser | null; // Can be ID or populated User
    seller: string | IUser;
    startTime: string;
    endTime: string;
    status: "upcoming" | "active" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

// 3. Standard Api Response (matches ApiResponse utility)
// We use <T> generics so TypeScript knows what type of data is inside "data"
export interface IApiResponse<T> {
    status: "success" | "fail" | "error";
    message: string;
    data: T;
}

// 4. Auth Payloads (what we send to the backend)
export interface ILoginPayload {
    email: string;
    password: string;
}

export interface IRegisterPayload extends ILoginPayload{
    name: string; // Inherits email and password, adds name
}