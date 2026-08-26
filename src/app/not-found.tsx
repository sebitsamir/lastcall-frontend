// src/app/not-found.tsx
/**
 * ────────────────────────────────────────────────────────────────────────────
 * GLOBAL 404
 * Even dead ends stay on-brand and offer a way back to the floor.
 * ────────────────────────────────────────────────────────────────────────────
 */
import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-24">
            <EmptyState
                icon={Compass}
                title="This corridor doesn't exist"
                description="The page you're looking for was moved, sold, or never listed."
                action={
                    <Button size="sm" asChild>
                        <Link href="/auctions">Back to the floor</Link>
                    </Button>
                }
            />
        </div>
    );
}