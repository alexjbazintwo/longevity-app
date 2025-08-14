import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  Shield,
  Star,
  HeartPulse,
  Activity,
  Brain,
  LineChart,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// --- Replace these with your own images/videos when ready ---
// Hand-picked Unsplash stills (permissive). Feel free to swap to local files in /public.
const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1600&auto=format&fit=crop",
];

const FEATURE_IMAGES = [
  "https://images.unsplash.com/photo-1516222338250-863216ce01ea?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1600&auto=format&fit=crop",
];

const NAV_LINKS = [
  "Product",
  "How it works",
  "Programs",
  "Research",
  "Pricing",
  "Reviews",
  "About",
  "Contact",
  "Sign in",
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActiveSlide((s) => (s + 1) % HERO_SLIDES.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  const bubbles = useMemo(
    () => [
      { label: "more healthy years", value: "+24%" },
      { label: "longer lifespan", value: "+18%" },
      { label: "habit adherence", value: "+40%" },
      { label: "VO₂ max gain (yr 1)", value: "+12%" },
    ],
    []
  );

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Top Banner / Navigation */}
      <header className="relative z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/90 via-emerald-400/80 to-teal-500/90 shadow-lg shadow-teal-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-bold tracking-tight">FIT to 100</div>
              <div className="text-xs text-white/70">AI Longevity Lab</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop nav (visual only) */}
            <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
              {NAV_LINKS.map((item) => (
                <a key={item} href="#" className="hover:text-white">
                  {item}
                </a>
              ))}
            </nav>

            {/* Hamburger menu (Sheet) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="border-white/10 bg-black/95 text-white">
                <SheetHeader>
                  <SheetTitle className="text-left text-lg">Explore</SheetTitle>
                </SheetHeader>
                <Separator className="my-4 bg-white/10" />
                <div className="grid gap-3">
                  {NAV_LINKS.map((item) => (
                    <Button
                      key={item}
                      variant="ghost"
                      className="justify-start rounded-xl text-base text-white/90 hover:bg-white/10"
                    >
                      {item}
                    </Button>
                  ))}
                </div>
                <Separator className="my-6 bg-white/10" />
                <div className="space-y-3">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-500 text-black hover:opacity-90">
                    Start your free trial
                  </Button>
                  <Button
                    className="w-full rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                    variant="outline"
                  >
                    Learn more
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* HERO with slideshow background */}
      <section className="relative isolate">
        {/* Background slides */}
        <div className="absolute inset-0 overflow-hidden">
          {HERO_SLIDES.map((src, i) => (
            <motion.img
              key={src}
              src={src}
              alt="Background"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{
                opacity: activeSlide === i ? 1 : 0,
                scale: activeSlide === i ? 1 : 1.05,
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          ))}
          {/* Vignette / gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-teal-500/20 blur-[80px]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col justify-center gap-8 px-4 py-20 sm:px-8">
          <Badge className="w-fit rounded-full bg-white/10 px-4 py-2 text-white/80 backdrop-blur">
            Longevity, reimagined with AI
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          >
            Next‑gen{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400">
              AI Longevity Coaching
            </span>
            — designed for founders, leaders & high performers.
          </motion.h1>

          <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Precision programs built from your biomarkers, lifestyle, and goals.
            Your personal AI coach adapts weekly to keep you on track—adding
            healthy years without the guesswork.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="group rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-500 px-6 text-black shadow-lg shadow-emerald-500/20 hover:opacity-90">
              Start your free trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/20 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/15"
            >
              See how it works
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/20 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/15"
            >
              <Link to="/life-expectancy-form">Check your longevity</Link>
            </Button>
          </div>

          <div className="mt-8">
            <p className="mb-4 text-xs uppercase tracking-wider text-white/60">
              People who use Fit to 100 see up to:
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {bubbles.map((b) => (
                <Card
                  key={b.label}
                  className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md"
                >
                  <CardContent className="flex h-24 flex-col items-center justify-center p-0">
                    <div className="text-3xl font-bold leading-none sm:text-4xl">
                      {b.value}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-white/70">
                      {b.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-white/60">
              Illustrative; individual results vary.
            </div>
          </div>
        </div>
      </section>

      {/* Trust blurb */}
      <section className="border-y border-white/10 bg-gradient-to-b from-black to-black/95">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:grid-cols-3 sm:px-8">
          <div className="sm:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for those who won’t leave their health to chance.
            </h2>
            <p className="mt-3 max-w-2xl text-white/75">
              As a trusted AI longevity platform, Fit to 100 equips you with
              science‑grounded plans, real‑time feedback, and automated habit
              systems. Make data‑driven decisions, not guesses.
            </p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4 opacity-80">
            <Badge className="rounded-xl bg-white/10 px-3 py-2 text-white">
              Biomarkers
            </Badge>
            <Badge className="rounded-xl bg-white/10 px-3 py-2 text-white">
              Coaching
            </Badge>
            <Badge className="rounded-xl bg-white/10 px-3 py-2 text-white">
              Insights
            </Badge>
          </div>
        </div>
      </section>

      {/* Feature rows */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="relative mx-auto w-full max-w-7xl space-y-20 px-4 py-20 sm:px-8">
          <FeatureRow
            title="Precision plans that adapt every week"
            text="Your plan evolves with your data—sleep, training load, stress, labs, and adherence—so you always work on the highest‑leverage actions."
            bullets={[
              "Glucose‑aware nutrition",
              "VO₂ max & strength periodization",
              "Recovery‑first scheduling",
            ]}
            image={FEATURE_IMAGES[0]}
            icon={<HeartPulse className="h-6 w-6" />}
          />
          <FeatureRow
            reverse
            title="AI coaching with human‑level nuance"
            text="Coach Sigma watches for friction, plateaus, and relapse patterns—then re‑routes you with micro‑adjustments, prompts, and habit loops."
            bullets={[
              "Daily nudges",
              "Breakthrough blockers",
              "Consistency tracking",
            ]}
            image={FEATURE_IMAGES[1]}
            icon={<Brain className="h-6 w-6" />}
          />
          <FeatureRow
            title="Real‑time analytics you can act on"
            text="From survival trajectories to training zones—see what moves the needle this week and what to ignore. Clarity beats motivation."
            bullets={[
              "Longevity curve",
              "Zone 2 & HIIT balance",
              "Strength age vs. peers",
            ]}
            image={FEATURE_IMAGES[2]}
            icon={<LineChart className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-y border-white/10 bg-black/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
          <h3 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            The Fit to 100 Philosophy
          </h3>
          <p className="max-w-3xl text-white/80">
            We believe longevity is a systems problem. The right plan isn’t just
            about workouts or supplements—it’s the compound effect of sleep,
            nutrition, strength, cardio, environment, and mindset working
            together. Our platform blends behavioral science with AI to craft a
            routine you’ll actually follow, with feedback loops that keep
            improving your healthspan month after month.
          </p>
        </div>
      </section>

      {/* Smart Analytics CTA */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(16,185,129,0.08))]" />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:grid-cols-2 sm:px-8">
          <div>
            <h3 className="text-2xl font-semibold sm:text-3xl">
              Fit to 100 Smart Analytics
            </h3>
            <p className="mt-3 max-w-xl text-white/80">
              Try it free for 14 days and see how our integrated coaching,
              tracking, and insights transform your decisions. No credit card
              required. No installs. Cancel anytime.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-500 text-black">
                Try it free now
                <PlayCircle className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Explore the dashboard
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              icon={<Activity className="h-4 w-4" />}
              label="Zone 2 minutes /wk"
              value="+110"
            />
            <MiniStat
              icon={<HeartPulse className="h-4 w-4" />}
              label="Resting HR"
              value="-8 bpm"
            />
            <MiniStat
              icon={<Brain className="h-4 w-4" />}
              label="Stress score"
              value="-21%"
            />
            <MiniStat
              icon={<LineChart className="h-4 w-4" />}
              label="Strength age"
              value="-6 yrs"
            />
          </div>
        </div>
      </section>

      {/* Achievements & Awards */}
      <section className="border-y border-white/10 bg-black/70">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
          <h3 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            Achievements & Awards
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TrophyCard
              title="Innovation"
              subtitle="HealthTech"
              icon={<Trophy className="h-6 w-6" />}
            />
            <TrophyCard
              title="Security"
              subtitle="Data & Privacy"
              icon={<Shield className="h-6 w-6" />}
            />
            <TrophyCard
              title="Experience"
              subtitle="UX Excellence"
              icon={<Award className="h-6 w-6" />}
            />
            <TrophyCard
              title="Satisfaction"
              subtitle="4.9/5 avg."
              icon={<Star className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
          <h3 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            What members say
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ReviewCard
              name="Amira S."
              role="Founder & CEO"
              text="The first plan that made sense of my labs, sleep, and training—in one place. I’m less stressed and fitter than I’ve been in a decade."
            />
            <ReviewCard
              name="Daniel P."
              role="Engineer"
              text="Coach Sigma is spooky good at catching when I'm about to slip. The weekly tweaks keep me consistent without the burnout."
            />
            <ReviewCard
              name="Chloe R."
              role="Investor"
              text="The analytics showed exactly what to focus on. I stopped guessing, started improving. Beautiful product."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-8">
          <div className="text-sm text-white/70">
            © {new Date().getFullYear()} Fit to 100. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Security
            </a>
          </div>
        </div>
      </footer>
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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white/80">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
            {icon}
          </span>
          <span className="text-xs">Feature</span>
        </div>
        <h4 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h4>
        <p className="mt-3 max-w-xl text-white/80">{text}</p>
        <ul className="mt-4 grid gap-2 text-white/80">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-400" />
              <span className="text-sm">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
          <motion.img
            src={image}
            alt="Feature"
            className="h-72 w-full object-cover sm:h-80"
            initial={{ scale: 1.05 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
          {icon}
        </div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
      <div className="mt-1 text-xs text-white/70">{label}</div>
    </div>
  );
}

function TrophyCard({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10">
        {icon}
      </div>
      <div className="text-sm text-white/60">{subtitle}</div>
      <div className="text-lg font-semibold">{title}</div>
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
    <Card className="rounded-2xl border-white/10 bg-white/5">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-white/85">“{text}”</p>
        <div className="text-sm text-white/70">
          <span className="font-medium text-white">{name}</span> • {role}
        </div>
      </CardContent>
    </Card>
  );
}
