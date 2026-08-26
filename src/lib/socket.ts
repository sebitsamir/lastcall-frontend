// src/lib/socket.ts
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

// Production-safe: no silent localhost fallback
const SOCKET_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || // Strip /api/v1 for socket
    (process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : undefined);

if (!SOCKET_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL is not configured. Socket.IO cannot connect."
    );
}

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            withCredentials: true,
            auth: {
                token: () => Cookies.get("accessToken") || "",
            },
        });

        socket.on("connect", () => {
            console.log("[Socket] Connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
        });

        socket.on("connect_error", (err) => {
            console.error("[Socket] Connection error:", err.message);
        });

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