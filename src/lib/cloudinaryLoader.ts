import type { ImageLoaderProps } from "next/image";

export default function cloudinaryLoader({
    src,
    width,
}: ImageLoaderProps): string {
    if (!src.includes("res.cloudinary.com")) {
        return src;
    }

    const uploadSegment = "/image/upload/";

    if (!src.includes(uploadSegment)) {
        return src;
    }

    const transformation = [
        "f_auto",
        "q_auto:good",
        `c_limit,w_${width}`,
    ].join("/");

    return src.replace(
        uploadSegment,
        `${uploadSegment}${transformation}/`
    );
}