import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [64, 96, 128, 160, 256, 384],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
        ],
    },

    turbopack: {
        root: process.cwd(),
    },
};

export default nextConfig;