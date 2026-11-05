import type { LucideIcon } from "lucide-react";

interface TrustItemProps {
    icon: LucideIcon;
    title: string;
    copy: string;
}

/** Small reassurance tile: gold glyph, bold line, quiet explanation. */
export function TrustItem({ icon: Icon, title, copy }: TrustItemProps) {
    return (
        <div className="flex items-center gap-3.5 rounded-[18px] border border-border bg-card px-[18px] py-4 text-[13px] text-muted-foreground">
            <Icon className="h-6 w-6 flex-none text-primary-text" strokeWidth={1.7} aria-hidden="true" />
            <span>
                <b className="block text-sm font-semibold text-foreground">{title}</b>
                {copy}
            </span>
        </div>
    );
}
