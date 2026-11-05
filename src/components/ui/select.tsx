import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Native <select> with the same field language as <Input>.
 * Native keeps the OS picker on mobile; the chevron is purely decorative.
 */
const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }
>(({ className, wrapperClassName, children, ...props }, ref) => (
  <div className={cn("relative", wrapperClassName)}>
    <select
      ref={ref}
      className={cn(
        "h-12 w-full appearance-none rounded-field border border-border bg-secondary pl-4 pr-10 text-base text-foreground transition-[border-color,box-shadow]",
        "focus-visible:border-primary-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      strokeWidth={1.7}
      aria-hidden="true"
    />
  </div>
));
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
