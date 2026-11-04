// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap select-none font-semibold tracking-[0.01em] transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "relative overflow-hidden border border-transparent bg-primary text-primary-foreground hover:bg-accent after:pointer-events-none after:absolute after:inset-0 after:translate-x-[-120%] after:bg-[linear-gradient(105deg,transparent_38%,hsl(0_0%_100%/0.18)_50%,transparent_62%)] hover:after:animate-sheen",
        secondary: "border border-border bg-secondary text-foreground hover:bg-surface-3",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-secondary",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        destructive: "border border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "h-9 min-h-9 px-4 text-[13px]",
        md: "h-11 min-h-11 px-5 text-sm",
        lg: "h-12 min-h-12 px-6 text-[15px] max-md:h-12",
        icon: "h-11 w-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.7} />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
