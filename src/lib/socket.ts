// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

// Socket.io connects to the server origin, not the /api/v1 REST base path
const getSocketUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    return apiUrl.replace(/\/api\/v1\/?$/, "");
};

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(getSocketUrl(), {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }
    return socket;
};
