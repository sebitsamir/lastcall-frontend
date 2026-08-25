/**
 * HOMEPAGE  (Phase 2, Chunk 4)
 * The homepage is the market, not a brochure.
 *
 * Data strategy: ONE request (active auctions, sorted by urgency) drives the
 * hero lot, the ticker, and the live grid. Derived slices are computed with
 * useMemo — no redundant network calls, no fake placeholder inventory.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gavel } from "lucide-react";

import type { IAuction } from "@/types";
import { auctionsApi } from "@/lib/api/auctions";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AuctionGrid } from "@/components/auction/AuctionGrid";
import { HeroLot } from "@/components/marketing/HeroLot";
import { LiveTicker } from "@/components/marketing/LiveTicker";
import { CategoryIndex } from "@/components/marketing/CategoryIndex";

/** One request feeds the whole page; 12 keeps the grid balanced. */
const HOME_LIMIT = 12;

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  /* ── Server state ─────────────────────────────────────────────────────── */
  const [auctions, setAuctions] = useState<IAuction[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  /** Stale-response guard (same discipline as the Auctions page). */
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setStatus("loading");

    // Urgency-first: the most "alive" lots lead the hero and ticker.
    auctionsApi
      .list({ sortBy: "endingSoon", limit: HOME_LIMIT })
      .then((result) => {
        if (id !== requestId.current) return; // superseded — drop silently
        setAuctions(result.auctions);
        setStatus("ready");
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setStatus("error");
      });
  }, []);

  // Initial fetch only; retries go through `load` explicitly.
  useEffect(() => {
    load();
  }, [load]);

  /* ── Derived slices (pure, memoized) ──────────────────────────────────── */
  // The UI only ever presents ACTIVE lots on the homepage; other states
  // belong to the Auctions page and the account surfaces.
  const active = useMemo(
    () => auctions.filter((a) => a.status === "active"),
    [auctions]
  );

  // Featured = the most urgent live lot. The hero leads with urgency.
  const featured = active[0] ?? null;

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-20 pb-20">
      {/* ══ HERO: statement left, live lot right ══ */}
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-14 md:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-20">
        {/* Left — the editorial statement */}
        <div className="flex flex-col justify-center space-y-8">
          <p className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
            <span className="h-1 w-1 animate-pulse rounded-full bg-primary" />
            Live Auction
          </p>

          <h1 className="font-serif text-5xl leading-[1.05] text-foreground md:text-6xl">
            The market moves.
            <br />
            You decide.
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Rare objects. Real competition. One final bid.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => undefined} asChild>
              <a href="/auctions">Explore Live Auctions</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              {/* Auth-aware: sellers go straight to creation, guests to auth. */}
              <a href={isAuthenticated ? "/auctions/create" : "/login"}>Sell an Item</a>
            </Button>
          </div>
        </div>

        {/* Right — the hero IS an auction */}
        {status === "loading" ? (
          <HeroSkeleton />
        ) : featured ? (
          <HeroLot auction={featured} />
        ) : (
          // Quiet floor: no live lots yet. Designed, not broken.
          <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card/40 p-10 text-center">
            <p className="font-serif text-2xl text-foreground">The floor is quiet.</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              No live auctions right now. Be the first to list something extraordinary.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <a href={isAuthenticated ? "/auctions/create" : "/login"}>Sell an Item</a>
            </Button>
          </div>
        )}
      </section>

      {/* ══ LIVE TICKER: the market's pulse ══ */}
      {status === "ready" && <LiveTicker auctions={active} />}

      {/* ══ LIVE AUCTIONS: real inventory ══ */}
      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 md:px-8">
        <SectionHeading
          overline="Live Now"
          title="Live Auctions"
          description="What's moving right now. Every lot verified."
          action={
            <Button variant="ghost" size="sm" asChild>
              <a href="/auctions">View All</a>
            </Button>
          }
        />

        {status === "error" ? (
          <ErrorState
            title="Couldn't reach the market"
            description="Live inventory didn't arrive. Check your connection and try again."
            action={
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : status === "ready" && active.length === 0 ? (
          <EmptyState
            icon={Gavel}
            title="No live auctions"
            description="Be the first to list something extraordinary."
            action={
              <Button variant="outline" size="sm" asChild>
                <a href={isAuthenticated ? "/auctions/create" : "/login"}>Sell an Item</a>
              </Button>
            }
          />
        ) : (
          <AuctionGrid auctions={active} loading={status === "loading"} skeletonCount={6} />
        )}
      </section>

      {/* ══ CATEGORY INDEX ══ */}
      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 md:px-8">
        <SectionHeading
          overline="Browse"
          title="Categories"
          description="Every department of the house."
        />
        <CategoryIndex />
      </section>

      {/* ══ HOW LASTCALL WORKS: trust mechanics, not marketing cards ══ */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="grid divide-y divide-border border border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          <HowStep number="01" title="Watch" copy="Follow lots as the clock runs." />
          <HowStep number="02" title="Bid" copy="Funds are reserved only while you lead." />
          <HowStep number="03" title="Win" copy="Settlement executes the moment the hammer falls." />
        </div>
      </section>
    </div>
  );
}

/* ── Internal presentational helpers ─────────────────────────────────────── */

/** Mirrors HeroLot geometry so the loading swap never shifts layout. */
function HeroSkeleton() {
  return (
    <div className="border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-4 p-6">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <div className="flex items-end justify-between border-t border-border pt-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

/** One cell of the "how it works" strip. Serif numerals, hairline dividers. */
function HowStep({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <div className="space-y-3 p-8">
      <p className="font-serif text-3xl text-primary/70 tabular-nums">{number}</p>
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{copy}</p>
    </div>
  );
}