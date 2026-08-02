import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Shield, TrendingUp } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* Navigation - Clean, solid borders, no gradient lines */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" href="/" className="mt-7" />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gold text-background font-semibold hover:bg-amber-400 transition-colors">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Pure, solid, typographic focus */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 lg:px-8 bg-background">
        <div className="relative z-10 mx-auto max-w-5xl text-center">

          {/* Headline - Solid colors, maximum impact */}
          <h1 className="font-display text-xl md:text-xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            The Last Call for
            <br />
            <span className="text-gold">Extraordinary Pieces</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Where collectors, investors, and connoisseurs compete for verified masterpieces
            in a secure, real-time marketplace.
          </p>

          {/* CTAs - Solid, authoritative buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-base bg-gold text-background font-semibold hover:bg-amber-400 shadow-xl shadow-gold/10 transition-all hover:scale-105">
                Start Bidding
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auctions">
              <Button variant="outline" size="lg" className="h-14 px-10 text-base border-border bg-transparent hover:border-gold/50 hover:text-gold transition-all">
                Browse Auctions
              </Button>
            </Link>
          </div>

          {/* Feature highlights - Minimal, clean, solid backgrounds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Shield, label: "Verified Sellers", desc: "100% authenticated" },
              { icon: Clock, label: "Real-Time Bids", desc: "Millisecond precision" },
              { icon: TrendingUp, label: "Secure Escrow", desc: "Protected transactions" },
            ].map((item, i) => (
              <div key={item.label} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-card transition-colors group">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card group-hover:border-gold/50 group-hover:bg-gold/5 transition-all">
                  <item.icon className="h-5 w-5 text-gold group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-sm font-semibold text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground text-center">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Preview Section - Clean, structured, no gradients */}
      <section className="border-t border-border py-24 px-6 lg:px-8 bg-card/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Currently Trending
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
                Featured Auctions
              </h2>
            </div>
            <Link href="/auctions" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Simple preview cards - Solid colors, sharp borders */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Vintage Patek Philippe", bid: "$12,500", time: "2h 34m" },
              { title: "Rare Diamond Necklace", bid: "$45,000", time: "5h 12m" },
              { title: "1965 Shelby Cobra", bid: "$890,000", time: "1d 3h" },
            ].map((item, i) => (
              <div key={item.title} className="group p-6 rounded-xl border border-border bg-card hover:border-gold/40 transition-all duration-300 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="aspect-[4/3] rounded-lg bg-secondary mb-4 overflow-hidden border border-border/50">
                  {/* Solid placeholder, absolutely no gradients */}
                  <div className="w-full h-full bg-muted/50 group-hover:bg-muted transition-colors duration-500 flex items-center justify-center">
                    <span className="text-muted-foreground/30 font-display text-2xl">Image</span>
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <span className="text-gold font-semibold">{item.bid}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA - Bold, solid, direct */}
      <section className="py-32 px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
            Ready to Make Your
            <br />
            <span className="text-gold">Winning Bid?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of collectors competing for the world's most exceptional pieces.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-base bg-gold text-background font-semibold hover:bg-amber-400 shadow-xl shadow-gold/10 transition-all">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Minimal, structured */}
      <footer className="border-t border-border py-12 px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-display text-sm font-bold text-foreground">
            Last<span className="text-gold">Call</span>
          </span>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/auctions" className="hover:text-gold transition-colors">Auctions</Link>
            <Link href="/login" className="hover:text-gold transition-colors">Sign In</Link>
          </div>

          <p className="text-sm text-muted-foreground">© 2026 LastCall.</p>
        </div>
      </footer>
    </div>
  );
}