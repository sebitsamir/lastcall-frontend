// src/components/layout/Logo.tsx
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    href?: string;
    className?: string;
}

export function Logo({ size = "md", href = "/", className = "" }: LogoProps) {
    // Define heights based on size, width will auto-adjust to maintain aspect ratio
    const sizes = {
        sm: { height: 32, className: "h-8 w-auto" },   // Perfect for Navbar & Footer
        md: { height: 48, className: "h-12 w-auto" },  // Perfect for Auth pages
        lg: { height: 64, className: "h-16 w-auto mt-3" },  // Perfect for Landing Page Hero
    };

    const currentSize = sizes[size];

    const LogoImage = (
        <Image
            src="/logo.png"
            alt="LastCall Logo"
            width={currentSize.height * 3} 
            height={currentSize.height}
            className={`${currentSize.className} ${className}`}
            priority={size === "lg" || size === "sm"} 
        />
    );

    if (href) {
        return (
            <Link href={href} className="inline-block transition-transform hover:scale-105 duration-300">
                {LogoImage}
            </Link>
        );
    }

    return LogoImage;
}