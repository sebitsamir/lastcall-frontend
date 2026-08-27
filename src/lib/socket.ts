// src/lib/socket.ts
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:5000" : undefined);

if (!SOCKET_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured. Socket.IO cannot connect.");
}

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        const token = Cookies.get("accessToken") || "";
        socket = io(SOCKET_URL, {
            autoConnect: false,
            withCredentials: true,
            auth: { token },
        });

        if (process.env.NODE_ENV === "development") {
            socket.on("connect", () => console.log("[Socket] Connected:", socket?.id));
            socket.on("disconnect", () => console.log("[Socket] Disconnected"));
            socket.on("connect_error", (err) => console.error("[Socket] Error:", err.message));
        }

        socket.connect();
    }
    return socket;
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function reconnectSocket(): void {
    const token = Cookies.get("accessToken") || "";
    if (socket) {
        socket.auth = { token }; // Update the auth payload
        socket.disconnect();      // Force disconnect
        socket.connect();         // Reconnect with the new token
    }
    // If socket is null, getSocket() will naturally pick up the new cookie next time it's called.
}