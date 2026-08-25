// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm whitespace-nowrap select-none font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-accent",
        secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-popover",
        outline: "border border-border bg-transparent text-foreground hover:border-primary/50 hover:text-primary",
        ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        destructive: "border border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "h-8 px-3 text-[10px] uppercase tracking-[0.15em]",
        md: "h-10 px-5 text-[11px] uppercase tracking-[0.15em]",
        lg: "h-12 px-8 text-xs uppercase tracking-[0.15em]",
        icon: "h-9 w-9",
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
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };