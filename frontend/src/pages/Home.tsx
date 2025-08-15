import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVertical } from "@/context/verticalContext";

export default function Home() {
  const { pack } = useVertical();
  const [activeSlide, setActiveSlide] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

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
    () => [
      { label: "race time (12–24 wks)", value: "-3.4%" },
      { label: "resting heart rate", value: "-7 bpm" },
      { label: "injury days per block", value: "-23%" },
      { label: "plan adherence", value: "+29%" },
    ],
    []
  );

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* HERO with slideshow background */}
      <section className="relative isolate">
        <div className="absolute inset-0 overflow-hidden">
          {pack.hero.slides.map((src, i) => {
            const hidden = failed[src];
            return (
              <motion.img
                key={src}
                src={src}
                alt="Background"
                className={`absolute inset-0 h-full w-full object-cover ${
                  hidden ? "hidden" : ""
                }`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{
                  opacity: activeSlide === i ? 1 : 0,
                  scale: activeSlide === i ? 1 : 1.05,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                onError={() => setFailed((f) => ({ ...f, [src]: true }))}
              />
            );
          })}
          {/* Slightly navy-tinted overlay so the hero gels with the header */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1024]/40 via-[#0a1024]/35 to-black/75" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-orange-400/15 blur-[100px]" />
          <div className="pointer-events-none absolute left-10 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-[90px]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col justify-center gap-8 px-4 py-20 sm:px-8">
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
            {pack.hero.ctas.map((cta) => (
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
                <Link to={cta.to}>
                  {cta.label}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            ))}
          </div>

          {/* Promise / Proof strip */}
          <div className="mt-8 rounded-2xl border border-indigo-300/15 bg-indigo-500/10 p-4 ring-1 ring-indigo-400/10 backdrop-blur sm:p-5">
            <p className="text-xs uppercase tracking-wider text-white/85">
              Why AI beats templates
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ProofStat
                value="2.2×"
                label="Higher PR rate"
                note="at target race"
              />
              <ProofStat
                value="+35%"
                label="Comfortable distance"
                note="longest run in 12 wks"
              />
              <ProofStat
                value="-30%"
                label="Injury days"
                note="per training block"
              />
              <ProofStat
                value="+29%"
                label="Plan adherence"
                note="vs static plans"
              />
            </div>
            <div className="mt-2 text-[11px] text-white/75">
              Internal cohort; illustrative for preview. Individual results
              vary.
            </div>
          </div>

          {/* Outcome bubbles */}
          <div className="mt-8">
            <p className="mb-4 text-xs uppercase tracking-wider text-white/75">
              What runners improve with Coach Sigma (median after 12–24 weeks):
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {bubbles.map((b) => (
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
        </div>
      </section>

      {/* Trust blurb */}
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
            <Badge className="rounded-xl bg-indigo-500/10 px-3 py-2 text-white ring-1 ring-indigo-400/15">
              AI Paces
            </Badge>
            <Badge className="rounded-xl bg-indigo-500/10 px-3 py-2 text-white ring-1 ring-indigo-400/15">
              Coaching
            </Badge>
            <Badge className="rounded-xl bg-indigo-500/10 px-3 py-2 text-white ring-1 ring-indigo-400/15">
              Insights
            </Badge>
          </div>
        </div>
      </section>

      {/* Feature rows */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_35%)]" />
        <div className="relative mx-auto w-full max-w-7xl space-y-20 px-4 py-20 sm:px-8">
          <FeatureRow
            title="Race-specific plans, tuned by AI each week"
            text="Your plan evolves with your pace, load, sleep and stress—so you always work on what moves the needle now."
            bullets={[
              "Auto-calculated paces",
              "Long-run structure & fuelling cues",
              "Recovery-first scheduling",
            ]}
            image={pack.assets.featureImages[0]}
            icon={<HeartPulse className="h-6 w-6" />}
          />
          <FeatureRow
            reverse
            title="Coach Sigma catches fatigue early"
            text="We watch your consistency and HR trends to detect early fatigue or niggles—then re-route you with micro-adjustments."
            bullets={[
              "Daily nudges",
              "Stress & load balance",
              "Consistency tracking",
            ]}
            image={pack.assets.featureImages[1]}
            icon={<Brain className="h-6 w-6" />}
          />
          <FeatureRow
            title="Real-time analytics you can act on"
            text="From race-pace zones to training load—see what matters this week and what to ignore. Clarity beats motivation."
            bullets={[
              "VO₂ proxy & thresholds",
              "Zone 2 vs quality balance",
              "Fatigue vs fitness trends",
            ]}
            image={pack.assets.featureImages[2]}
            icon={<LineChart className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* Smart Analytics CTA */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(99,102,241,0.10),rgba(16,185,129,0.08))]" />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:grid-cols-2 sm:px-8">
          <div>
            <h3 className="text-2xl font-semibold sm:text-3xl">
              Fit to 100 Smart Analytics
            </h3>
            <p className="mt-3 max-w-xl text-white/85">
              Not templates—intelligence. Our AI coach adapts your training as
              your data changes. Hit your PR or build a running habit for life,
              without the guesswork.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                className="rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black"
                asChild
              >
                <Link to="/onboarding">
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
            <MiniStat
              icon={<Activity className="h-4 w-4" />}
              label="Weekly km"
              value="+28"
            />
            <MiniStat
              icon={<HeartPulse className="h-4 w-4" />}
              label="Resting HR"
              value="-6 bpm"
            />
            <MiniStat
              icon={<Brain className="h-4 w-4" />}
              label="Stress score"
              value="-18%"
            />
            <MiniStat
              icon={<LineChart className="h-4 w-4" />}
              label="Threshold pace"
              value="+12s/km"
            />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
          <h3 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            What runners say
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ReviewCard
              name="Amira S."
              role="Marathoner"
              text="The first plan that adapted to my life. My long runs finally clicked—and I PR’d by 9 minutes."
            />
            <ReviewCard
              name="Daniel P."
              role="10K/Engineer"
              text="Coach Sigma catches fatigue before I do. The tweaks kept me healthy and progressing."
            />
            <ReviewCard
              name="Chloe R."
              role="Half Marathon"
              text="The paces and structure removed guesswork. I stopped winging it and started improving."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProofStat({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-indigo-300/15 bg-indigo-500/10 p-3 ring-1 ring-indigo-400/10">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-white/85">{label}</div>
      {note && <div className="text-[11px] text-white/75">{note}</div>}
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
  icon: React.ReactNode;
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
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300" />
              <span className="text-sm">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-300/15 bg-indigo-500/10 ring-1 ring-indigo-400/10 shadow-2xl shadow-black/30">
          <motion.img
            src={image}
            alt="Feature"
            className="h-72 w-full object-cover sm:h-80"
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
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
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
          {[...Array(5)].map((_, i) => (
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
