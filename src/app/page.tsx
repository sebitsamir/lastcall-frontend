/**
 * HOMEPAGE
 * The homepage is the market, not a brochure.
 *
 * Data strategy: ONE request (active auctions, sorted by urgency) drives the
 * hero lot, the ticker, and the live grid. Derived slices are computed with
 * useMemo — no redundant network calls, no fake placeholder inventory.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Eye, Gavel, type LucideIcon } from "lucide-react";

import type { IAuction } from "@/types";
import { auctionsApi } from "@/lib/api/auctions";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AuctionGrid } from "@/components/auction/AuctionGrid";
import { AuctionImage } from "@/components/auction/AuctionImage";
import { HeroLot } from "@/components/marketing/HeroLot";
import { LiveTicker } from "@/components/marketing/LiveTicker";
import { CategoryIndex } from "@/components/marketing/CategoryIndex";
import { PageTransition } from "@/components/layout/PageTransition";
import { Reveal } from "@/components/ui/reveal";
import { isLiveLot, isOpenLot } from "@/lib/auction/status";
import { useNow } from "@/hooks/useNow";

/** One request feeds the whole page; 12 keeps the grid balanced. */
const HOME_LIMIT = 12;

/** The hero carousel rotates through the three most urgent live lots. */
const HERO_LOTS = 3;

/** Shared page gutter (design `.w`). */
const WRAP = "mx-auto w-full max-w-[1200px] px-[clamp(16px,3vw,32px)]";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const now = useNow(1_000);

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
      .list({ sortBy: "endingSoon", limit: HOME_LIMIT, status: "floor" })
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
  const floor = useMemo(
    () => auctions.filter((a) => isOpenLot(a, now)),
    [auctions, now]
  );

  const active = useMemo(
    () => floor.filter((a) => isLiveLot(a, now)),
    [floor, now]
  );

  const heroLots = useMemo(() => active.slice(0, HERO_LOTS), [active]);

  // The sell band borrows a real lot photo when one exists.
  const bandLot = active[1] ?? active[0] ?? null;

  const sellHref = isAuthenticated ? "/auctions/create" : "/login";

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <PageTransition>
    <div className="pb-4">
      {/* ══ HERO: statement left, live lots right ══ */}
      <section className={WRAP}>
        <div className="relative mt-6 grid overflow-hidden rounded-[22px] border border-border bg-card min-[481px]:rounded-hero min-[900px]:min-h-[540px] min-[900px]:grid-cols-[1.05fr_.95fr]">
          <div
            className="pointer-events-none absolute -left-16 top-0 h-64 w-64 animate-gold-breathe rounded-full bg-[radial-gradient(circle,hsl(var(--gold)/0.18),transparent_70%)] min-[900px]:h-80 min-[900px]:w-80"
            aria-hidden="true"
          />
          <div className="relative flex flex-col justify-center gap-5 px-5 pb-7 pt-6 min-[481px]:gap-6 min-[481px]:p-10 lg:p-14">
            <span className="animate-fade-up inline-flex h-6 w-fit items-center gap-1.5 rounded-full bg-live/15 px-3 text-xs font-semibold text-live">
              <span className="relative grid h-2 w-2 place-items-center" aria-hidden="true">
                <span className="animate-live-ping absolute inset-0 rounded-full bg-current" />
                <span className="relative h-2 w-2 rounded-full bg-current" />
              </span>
              Live auctions
            </span>

            <h1 className="animate-fade-up delay-1 max-w-[16ch] text-[30px] font-semibold leading-[1.14] tracking-[-0.02em] min-[481px]:text-[clamp(36px,4.8vw,56px)]">
              The Market moves.
              You decide.
            </h1>

            <p className="animate-fade-up delay-2 max-w-[40ch] text-base leading-relaxed text-muted-foreground">
              Rare objects. Live bidding. One last chance to win.
            </p>

            <div className="animate-fade-up delay-3 flex flex-wrap gap-3 [&>a]:max-[480px]:flex-1">
              <Button size="lg" asChild>
                <Link href="/auctions">Explore auctions</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how">How it works</a>
              </Button>
            </div>
          </div>

          {/* Right — the hero IS an auction */}
          {status === "loading" ? (
            <HeroSkeleton />
          ) : heroLots.length > 0 ? (
            <HeroLot auctions={heroLots} className="order-first min-[900px]:order-none" />
          ) : (
            // Quiet floor: no live lots yet. Designed, not broken.
            <div className="order-first flex flex-col items-center justify-center bg-secondary p-10 text-center min-[900px]:order-none">
              <p className="text-xl font-semibold tracking-[-0.03em]">Nothing is live yet.</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                List an item and open the floor.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href={sellHref}>Sell an Item</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ══ LIVE TICKER: the market's pulse ══ */}
      {status === "ready" && active.length > 0 && (
        <section className={`${WRAP} mt-6`}>
          <LiveTicker auctions={active} />
        </section>
      )}

      {/* ══ CATEGORY INDEX ══ */}
      <section className={`${WRAP} mt-12 min-[481px]:mt-[clamp(48px,7vw,80px)]`}>
        <Reveal>
          <SectionHead
            title="Browse by category"
            description="Art, watches, fashion, and more."
            href="/categories"
          />
          <CategoryIndex />
        </Reveal>
      </section>

      {/* ══ LIVE AUCTIONS: real inventory ══ */}
      <section className={`${WRAP} mt-12 min-[481px]:mt-[clamp(48px,7vw,80px)]`}>
        <Reveal>
        <SectionHead
          title="Featured auctions"
          description="Live and upcoming lots on the floor."
          href="/auctions"
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
        ) : status === "ready" && floor.length === 0 ? (
          <EmptyState
            icon={Gavel}
            title="No lots on the floor"
            description="Be the first to list something extraordinary."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={sellHref}>Sell an Item</Link>
              </Button>
            }
          />
        ) : (
          <AuctionGrid auctions={floor} loading={status === "loading"} skeletonCount={6} now={now} />
        )}
        </Reveal>
      </section>

      {/* ══ HOW LASTCALL WORKS ══ */}
      <section id="how" className={`${WRAP} mt-12 min-[481px]:mt-[clamp(48px,7vw,80px)]`}>
        <Reveal>
        <div className="rounded-[20px] border border-border bg-card p-[clamp(18px,2.5vw,28px)] min-[481px]:rounded-panel">
          <h3 className="mb-4 text-lg">How LastCall works</h3>
          <div className="grid gap-[18px] md:grid-cols-3">
            <HowStep icon={Eye} title="Watch" copy="Follow lots as the clock runs down." />
            <HowStep icon={Gavel} title="Bid" copy="Funds are reserved only while you lead." />
            <HowStep icon={BadgeCheck} title="Win" copy="Settlement executes the moment the hammer falls." />
          </div>
        </div>
        </Reveal>
      </section>

      {/* ══ SELL BAND ══ */}
      <section className={`${WRAP} mt-12 min-[481px]:mt-[clamp(48px,7vw,80px)]`}>
        <Reveal>
        <div className="grid overflow-hidden rounded-[22px] border border-border bg-card min-[481px]:rounded-hero min-[900px]:grid-cols-[1.1fr_.9fr]">
          <div className="grid content-center gap-5 px-5 py-6 min-[481px]:p-[clamp(28px,4vw,52px)]">
            <span className="inline-flex h-6 w-fit items-center rounded-full bg-primary/12 px-3 text-xs font-semibold text-primary-text">
              Sell on LastCall
            </span>
            <h2 className="text-[clamp(28px,3.6vw,44px)] tracking-[-0.03em]">
              Put your item on the floor.
            </h2>
            <p className="max-w-[42ch] text-base leading-relaxed text-muted-foreground">
              List with a few details and photos. Reach buyers worldwide.
            </p>
            <div>
              <Button size="lg" asChild>
                <Link href={sellHref}>Start selling</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[240px] overflow-hidden bg-secondary min-[900px]:min-h-[300px]">
            {bandLot ? (
              <AuctionImage
                src={bandLot.images?.[0]}
                alt={bandLot.title}
                sizes="(min-width: 900px) 40vw, 100vw"
                className="animate-ken-burns-slow"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground/50">
                <Gavel className="h-16 w-16" strokeWidth={1.2} aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
        </Reveal>
      </section>

    </div>
    </PageTransition>
  );
}

/* ── Internal presentational helpers ─────────────────────────────────────── */

function SectionHead({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[clamp(20px,2.4vw,28px)] font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="mt-1 max-w-[48ch] text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-text"
      >
        View all{" "}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

function HowStep({ icon: Icon, title, copy }: { icon: LucideIcon; title: string; copy: string }) {
  return (
    <div className="group flex items-start gap-4 rounded-[16px] p-1 transition-colors duration-300 hover:bg-secondary/80">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-[14px] bg-primary/12 text-primary-text transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
      </span>
      <div>
        <b className="mb-0.5 block text-base">{title}</b>
        <span className="text-sm text-muted-foreground">{copy}</span>
      </div>
    </div>
  );
}


/** Mirrors HeroLot geometry so the loading swap never shifts layout. */
function HeroSkeleton() {
  return (
    <div className="order-first min-h-[300px] bg-secondary p-4 min-[900px]:order-none min-[900px]:p-5">
      <div className="flex h-full min-h-[268px] items-end">
        <Skeleton className="h-28 w-full max-w-[340px] rounded-card bg-foreground/10" />
      </div>
    </div>
  );
}
