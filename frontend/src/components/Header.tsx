// src/components/header.tsx
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
import { useVertical } from "@/hooks/useVertical";
import type { NavItem } from "@/types/vertical";

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
        "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700",
        scrolled
          ? "border-b border-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]"
          : "",
      ].join(" ")}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg p-1.5 bg-white/5 ring-1 ring-white/10">
            <img
              src="/runzi.svg?v=3"
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

        <nav className="hidden items-center gap-6 text-sm text-white/85 lg:flex">
          {pack.nav.map((n: NavItem) => (
            <Link key={n.label} to={n.to} className="hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden rounded-lg bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 px-4 py-2 text-sm text-black lg:inline-flex"
          >
            <Link to="/setup">
              Start smarter training
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="ml-1 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-white/10 bg-black/95 text-white">
              <SheetHeader>
                <SheetTitle className="text-left text-lg">Menu</SheetTitle>
              </SheetHeader>
              <Separator className="my-4 bg-white/10" />
              <div className="grid gap-2">
                {pack.nav.map((n: NavItem) => (
                  <Button
                    key={n.label}
                    asChild
                    variant="ghost"
                    className="justify-start rounded-xl text-base text-white/90 hover:bg-white/10"
                  >
                    <Link to={n.to}>{n.label}</Link>
                  </Button>
                ))}
              </div>
              <Separator className="my-6 bg-white/10" />
              <Button
                asChild
                className="w-full rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black"
              >
                <Link to="/setup">Start smarter training</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
