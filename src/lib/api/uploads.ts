// src/lib/api/uploads.ts
/**
 * ────────────────────────────────────────────────────────────────────────────
 * UPLOADS API MODULE
 * Cloudinary-backed image uploads. The studio never sees FormData mechanics;
 * it awaits `uploadImage(file)` and gets a URL string — or a thrown error.
 * Response normalization tolerates every shape the backend has used.
 * ────────────────────────────────────────────────────────────────────────────
 */
import api from "@/lib/api";

const ENDPOINTS = {
    // If your backend mounts uploads elsewhere ("/upload", "/auctions/images"),
    // fix this ONE line.
    upload: "/uploads",
} as const;

/** Client-side mirrors of server rules: fast feedback, server authoritative. */
export const UPLOAD_LIMITS = {
    maxImages: 5,
    maxBytes: 5 * 1024 * 1024, // 5MB
    accept: ["image/jpeg", "image/png", "image/webp"],
} as const;

/**
 * Extract a usable URL from any of the backend's historical response shapes:
 *   "https://…" | { url } | { secure_url } | { data: { url | secure_url } }
 */
function normalizeImageUrl(payload: unknown): string {
    if (typeof payload === "string") return payload;

    const p = (payload ?? {}) as Record<string, unknown>;
    const data = (p.data ?? {}) as Record<string, unknown>;

    const candidate =
        p.url ?? p.secure_url ?? data.url ?? data.secure_url;

    if (typeof candidate === "string") return candidate;
    throw new Error("Upload response did not include an image URL");
}

export const uploadsApi = {
    async uploadImage(file: File): Promise<string> {
        const form = new FormData();
        // Field name mirrors the backend multer config; adjust here if it differs.
        form.append("image", file);

        const { data } = await api.post(ENDPOINTS.upload, form, {
        
        });

        return normalizeImageUrl(data);
    },
};