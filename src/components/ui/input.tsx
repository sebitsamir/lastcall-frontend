import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-field border border-border bg-secondary px-4 text-base text-foreground transition-[border-color,box-shadow]",
        "placeholder:text-muted-foreground",
        "focus-visible:border-primary-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
