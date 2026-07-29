import * as React from "react";
import { cn } from "@/lib/utils";

// 1. Define the variants and sizes (The Design Tokens)
const buttonVariants = {
    variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
        destructive: "bg-danger text-white hover:bg-danger-dark shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "text-primary-600 underline-offset-4 hover:underline",
    },
    size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
    },
};

// 2. Define the TypeScript Types for our custom props
type ButtonVariant = keyof typeof buttonVariants.variant;
type ButtonSize = keyof typeof buttonVariants.size;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonVariant;
}

// 3. The Component (Using forwardRef)
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps> (
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
            className={cn(
                // Base style applied to all buttons
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

                //Dynamic classes passed by the parent component (merged safely via cn)
                className
            )}
            ref={ref}
            {...props} // Spreads all other native HTML button props (Onclick, type, etc)
            />
        );
    }
);
Button.displayName = "Button";