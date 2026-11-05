import Image from "next/image";
import Link from "next/link";
import { AUCTION_CATEGORIES } from "@/lib/api/auctions";

const CATEGORY_IMAGES: Record<(typeof AUCTION_CATEGORIES)[number], string> = {
    Art: "/categories/art.jpg",
    Watches: "/categories/watches.jpg",
    Electronics: "/categories/electronics.jpg",
    Collectibles: "/categories/collectibles.jpg",
    Fashion: "/categories/fashion.jpg",
    Sports: "/categories/sports.jpg",
};

export function CategoryIndex() {
    return (
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-6 sm:gap-x-4 sm:gap-y-4">
            {AUCTION_CATEGORIES.map((category, index) => (
                <Link
                    key={category}
                    href={`/auctions?category=${encodeURIComponent(category)}`}
                    className="group flex flex-col items-center gap-2.5 text-center"
                >
                    <span className="relative aspect-square w-full max-w-[112px] overflow-hidden rounded-[20px] border border-border bg-secondary shadow-sm transition-[transform,border-color,box-shadow] duration-300 ease-out-soft group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lift sm:max-w-none">
                        <Image
                            src={CATEGORY_IMAGES[category]}
                            alt={category}
                            fill
                            sizes="(min-width: 640px) 160px, 30vw"
                            quality={70}
                            priority={index < 3}
                            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-110"
                        />
                    </span>
                    <span className="text-[13px] font-medium leading-none text-foreground transition-colors group-hover:text-primary-text">
                        {category}
                    </span>
                </Link>
            ))}
        </div>
    );
}
