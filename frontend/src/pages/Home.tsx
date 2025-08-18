// Home.tsx
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  HeartPulse,
  Activity,
  Brain,
  LineChart,
  PlayCircle,
  Cpu,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVertical } from "@/hooks/useVertical";
import type { Feature, Review, HeroCTA, VerticalPack } from "@/types/vertical";

type IconName = "HeartPulse" | "Trophy" | "Activity" | "Brain" | "LineChart";
const iconMap: Record<IconName, ComponentType<{ className?: string }>> = {
  HeartPulse,
  Trophy,
  Activity,
  Brain,
  LineChart,
};
function renderIcon(name: IconName, sizeClass: string) {
  const Cmp = iconMap[name] ?? Activity;
  return <Cmp className={sizeClass} />;
}

export default function Home() {
  const { pack } = useVertical();
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const attributionBySrc: NonNullable<VerticalPack["hero"]["credits"]> =
    pack.hero.credits ?? {};
  const heroObjectPosition: NonNullable<
    VerticalPack["hero"]["objectPosition"]
  > = pack.hero.objectPosition ?? {};

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((s) => {
        const next = (s + 1) % pack.hero.slides.length;
        for (let i = 0; i < pack.hero.slides.length; i++) {
          const idx = (next + i) % pack.hero.slides.length;
          if (!failed[pack.hero.slides[idx]]) return idx;
        }
        return s;
      });
    }, 6000);
    return () => clearInterval(id);
  }, [pack.hero.slides, failed]);

  const bubbles = useMemo(
    () => pack.outcomes?.items ?? [],
    [pack.outcomes?.items]
  );
  const currentSrc = pack.hero.slides[activeSlide];
  const credit = attributionBySrc[currentSrc];

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <section className="relative isolate">
        <div className="absolute inset-0 overflow-hidden">
          {pack.hero.slides.map((src: string, i: number) => {
            const hidden = failed[src];
            return (
              <motion.img
                key={src}
                src={src}
                alt="Background"
                className={`absolute inset-0 h-full w-full object-cover ${
                  hidden ? "hidden" : ""
                }`}
                style={{
                  objectPosition: heroObjectPosition[src] ?? "50% 50%",
                  willChange: "opacity",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeSlide === i ? 1 : 0 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                onError={() =>
                  setFailed((f) => ({
                    ...f,
                    [src]: true,
                  }))
                }
              />
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1024]/40 via-[#0a1024]/35 to-black/75" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-orange-400/15 blur-[100px]" />
          <div className="pointer-events-none absolute left-10 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-[90px]" />
        </div>

        {/** ↓ shorter hero + cap max height to avoid overscaling the image */}
        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center gap-8 px-4 py-16 sm:px-8 min-h-[58vh] md:min-h-[64vh] lg:min-h-[66vh] xl:min-h-[62vh] max-h-[760px]">
          <Badge className="w-fit rounded-full bg-indigo-500/10 px-4 py-2 text-white/80 ring-1 ring-indigo-400/20 backdrop-blur">
            <span className="inline-flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              {pack.brand.tagline}
            </span>
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300">
              {pack.hero.headline}
            </span>
          </motion.h1>

          <p className="max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
            {pack.hero.subhead}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {pack.hero.ctas.map((cta: HeroCTA) => (
              <Button
                key={cta.label}
                asChild
                className={`group rounded-xl px-6 shadow-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-400/40 ${
                  cta.kind === "primary"
                    ? "bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black shadow-emerald-500/20"
                    : "border-indigo-300/20 bg-indigo-400/10 text-white backdrop-blur hover:bg-indigo-400/15"
                }`}
                variant={cta.kind === "primary" ? "default" : "outline"}
              >
                <Link to={cta.to === "/onboarding" ? "/setup" : cta.to}>
                  {cta.label}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            ))}
          </div>

          {pack.proof && (
            <div className="mt-2 rounded-2xl border border-indigo-300/15 bg-indigo-500/10 p-4 ring-1 ring-indigo-400/10 backdrop-blur sm:p-5">
              <p className="text-xs uppercase tracking-wider text-white/85">
                {pack.proof.title}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {pack.proof.stats.map(
                  (s: { value: string; label: string; note?: string }) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-indigo-300/15 bg-indigo-500/10 p-3 ring-1 ring-indigo-400/10"
                    >
                      <div className="text-2xl font-semibold">{s.value}</div>
                      <div className="text-sm text-white/85">{s.label}</div>
                      {s.note && (
                        <div className="text-[11px] text-white/75">
                          {s.note}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
              <div className="mt-2 text-[11px] text-white/75">
                {pack.proof.footnote}
              </div>
            </div>
          )}
        </div>

        {credit && (
          <a
            href={credit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-3 z-10 rounded-md bg-indigo-500/20 px-2 py-1 text-[10px] text-white/85 ring-1 ring-indigo-400/30 backdrop-blur"
          >
            {credit.label}
          </a>
        )}
      </section>

      {pack.outcomes && (
        <section className="relative">
          <div className="relative mx-auto w-full max-w-7xl px-4 py-2 sm:px-8">
            <p className="mb-4 text-xs uppercase tracking-wider text-white/75">
              {pack.outcomes.title}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(bubbles as { label: string; value: string }[]).map((b) => (
                <Card
                  key={b.label}
                  className="rounded-2xl border border-indigo-300/15 bg-indigo-500/10 ring-1 ring-indigo-400/10 backdrop-blur-md"
                >
                  <CardContent className="flex h-24 flex-col items-center justify-center p-0">
                    <div className="text-3xl font-bold leading-none sm:text-4xl">
                      {b.value}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-white/80">
                      {b.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-white/70">
              Illustrative; individual results vary.
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-indigo-300/15 bg-gradient-to-b from-black to-black/95">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:grid-cols-3 sm:px-8">
          <div className="sm:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {pack.copy.trust.title}
            </h2>
            <p className="mt-3 max-w-2xl text-white/85">
              {pack.copy.trust.body}
            </p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4 opacity-90">
            {(pack.trust?.badges ?? []).map((b: string) => (
              <Badge
                key={b}
                className="rounded-xl bg-indigo-500/10 px-3 py-2 text-white ring-1 ring-indigo-400/15"
              >
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {pack.features && (
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_35%)]" />
          <div className="relative mx-auto w-full max-w-7xl space-y-20 px-4 py-20 sm:px-8">
            {pack.features.map((f: Feature) => (
              <FeatureRow
                key={f.key}
                title={f.title}
                text={f.text}
                bullets={f.bullets}
                image={f.image}
                icon={renderIcon(f.icon as IconName, "h-6 w-6")}
                reverse={!!f.reverse}
              />
            ))}
          </div>
        </section>
      )}

      {pack.cta?.smartAnalytics && (
        <section className="relative">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(99,102,241,0.10),rgba(16,185,129,0.08))]" />
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:grid-cols-2 sm:px-8">
            <div>
              <h3 className="text-2xl font-semibold sm:text-3xl">
                {pack.cta.smartAnalytics.title}
              </h3>
              <p className="mt-3 max-w-xl text-white/85">
                {pack.cta.smartAnalytics.body}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black"
                  asChild
                >
                  <Link to="/setup">
                    Try it free now
                    <PlayCircle className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-indigo-300/20 bg-indigo-400/10 text-white hover:bg-indigo-400/15"
                >
                  Explore the dashboard
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {pack.cta.smartAnalytics.stats.map(
                (
                  s: { icon: string; label: string; value: string },
                  i: number
                ) => (
                  <MiniStat
                    key={`${s.label}-${i}`}
                    label={s.label}
                    value={s.value}
                    icon={renderIcon(s.icon as IconName, "h-4 w-4")}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {pack.reviews && (
        <section>
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
            <h3 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">
              What runners say
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {pack.reviews.map((r: Review, i: number) => (
                <ReviewCard
                  key={`${r.name}-${i}`}
                  name={r.name}
                  role={r.role}
                  text={r.text}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureRow({
  title,
  text,
  bullets,
  image,
  icon,
  reverse = false,
}: {
  title: string;
  text: string;
  bullets: string[];
  image: string;
  icon: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-8 sm:grid-cols-2 ${
        reverse ? "sm:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-white/85 ring-1 ring-indigo-400/15">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-500/10">
            {icon}
          </span>
          <span className="text-xs">Feature</span>
        </div>
        <h4 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h4>
        <p className="mt-3 max-w-xl text-white/85">{text}</p>
        <ul className="mt-4 grid gap-2 text-white/85">
          {bullets.map((b: string) => (
            <li key={b} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300" />
              <span className="text-sm">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-indigo-300/15 bg-indigo-500/10 ring-1 ring-indigo-400/10 shadow-2xl shadow-black/30 sm:h-80">
        <motion.img
          src={image}
          alt="Feature"
          className="h-full w-full object-cover"
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-indigo-300/15 bg-indigo-500/10 p-4 ring-1 ring-indigo-400/10">
      <div className="flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/10">
          {icon}
        </div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
      <div className="mt-1 text-xs text-white/80">{label}</div>
    </div>
  );
}

function ReviewCard({
  name,
  role,
  text,
}: {
  name: string;
  role: string;
  text: string;
}) {
  return (
    <Card className="rounded-2xl border-indigo-300/15 bg-indigo-500/10 ring-1 ring-indigo-400/10">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i: number) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-white/90">“{text}”</p>
        <div className="text-sm text-white/80">
          <span className="font-medium text-white">{name}</span> • {role}
        </div>
      </CardContent>
    </Card>
  );
}
