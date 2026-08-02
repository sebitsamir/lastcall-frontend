// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

// We only want ONE socket instance for the entire application.
// This is the Singleton pattern.
let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
            withCredentials: true, // Send cookies if needed
            transports: ["websocket", "polling"], // Fallback to polling if WS fails
        });

        // Optional: Log connection for debugging
        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }
    return socket;
};