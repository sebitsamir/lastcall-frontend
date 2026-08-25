import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em]",
  {
    variants: {
      variant: {
        live: "border-primary/40 bg-primary/10 text-primary",
        upcoming: "border-border bg-secondary text-muted-foreground",
        ended: "border-border bg-transparent text-muted-foreground",
        cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
        success: "border-success/40 bg-success/10 text-success",
        neutral: "border-border bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("h-1 w-1 rounded-full bg-current", variant === "live" && "animate-pulse")} />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };