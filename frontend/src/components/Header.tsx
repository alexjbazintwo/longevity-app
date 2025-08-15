import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useVertical } from "@/context/verticalContext";

export default function Header() {
  const { pack } = useVertical();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = `${pack.brand.name} — ${pack.brand.tagline}`;
  }, [pack.brand.name, pack.brand.tagline, pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50",
        // Opaque navy gradient → no white flash
        "bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900",
        scrolled ? "border-b border-indigo-400/15" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        {/* Brand */}
        <Link to="/" className="flex min-w-0 items-center gap-3">
          {/* Navy-tinted chip so the R pops anywhere */}
          <div className="rounded-lg p-1.5 bg-indigo-500/10 ring-1 ring-indigo-400/20">
            <img
              src="/runzi.svg?v=4"
              alt={`${pack.brand.name} logo`}
              className="h-8 w-8"
              style={{
                filter:
                  "drop-shadow(0 1px 1.25px rgba(0,0,0,0.45)) drop-shadow(0 0 0.4px rgba(0,0,0,0.35))",
              }}
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="leading-tight">
            <div className="truncate text-base font-bold tracking-tight text-white">
              {pack.brand.name}
            </div>
            <div className="truncate text-[11px] text-white/75">
              {pack.brand.tagline}
            </div>
          </div>
        </Link>

        {/* Desktop nav (lg+) */}
        <nav className="hidden items-center gap-6 text-sm text-white/85 lg:flex">
          {pack.nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="rounded-sm outline-none transition-colors hover:text-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-400/40"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden rounded-lg bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 px-4 py-2 text-sm text-black shadow-lg shadow-emerald-500/10 focus-visible:ring-2 focus-visible:ring-indigo-400/40 lg:inline-flex"
          >
            <Link to="/onboarding">
              Start smarter training
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="ml-1 rounded-xl border-indigo-300/25 bg-indigo-400/10 text-white hover:bg-indigo-400/15 focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-indigo-300/20 bg-black/95 text-white">
              <SheetHeader>
                <SheetTitle className="text-left text-lg">Menu</SheetTitle>
              </SheetHeader>
              <Separator className="my-4 bg-indigo-300/15" />
              <div className="grid gap-2">
                {pack.nav.map((n) => (
                  <Button
                    key={n.label}
                    asChild
                    variant="ghost"
                    className="justify-start rounded-xl text-base text-white/90 hover:bg-indigo-400/15"
                  >
                    <Link to={n.to}>{n.label}</Link>
                  </Button>
                ))}
              </div>
              <Separator className="my-6 bg-indigo-300/15" />
              <Button
                asChild
                className="w-full rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black focus-visible:ring-2 focus-visible:ring-indigo-400/40"
              >
                <Link to="/onboarding">Start smarter training</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
