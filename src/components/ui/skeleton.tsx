import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded-field bg-foreground/[0.07]", className)} {...props} />;
}

export { Skeleton };