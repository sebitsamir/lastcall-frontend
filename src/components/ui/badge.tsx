import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status "chips" from the design: pill-shaped, soft tinted fills, no borders.
 *   live                   → live green (on-air, never money-green)
 *   gold / upcoming        → brand gold
 *   success                → financial green (winning, deposits)
 *   red / cancelled        → danger
 *   neutral / ended        → quiet
 */
const badgeVariants = cva(
  "inline-flex h-6 items-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        live: "bg-live/15 text-live",
        success: "bg-success/15 text-success",
        gold: "bg-primary/12 text-primary-text",
        upcoming: "bg-primary/12 text-primary-text",
        red: "bg-destructive/13 text-destructive",
        cancelled: "bg-destructive/13 text-destructive",
        ended: "bg-secondary text-muted-foreground",
        neutral: "bg-secondary text-muted-foreground",
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
      {dot && (
        <span className="relative grid h-[7px] w-[7px] place-items-center" aria-hidden="true">
          <span className="animate-live-ping absolute inset-0 rounded-full bg-current" />
          <span className="relative h-[7px] w-[7px] rounded-full bg-current" />
        </span>
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
