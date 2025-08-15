// src/pages/planPreview.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  HeartPulse,
  Dumbbell,
  Moon,
  Utensils,
  Info,
  ArrowRight,
  PencilLine,
  Activity,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  OnboardingState,
  Goal,
  DurationPreference,
} from "@/types/onboarding";

const STORAGE_KEY = "onboardingState";

type PlanTile = {
  title: string;
  icon: ReactNode;
  points: string[];
  why: string;
};

function ensureState(): OnboardingState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

export default function PlanPreviewPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState | null>(null);

  useEffect(() => {
    const s = ensureState();
    if (
      !s ||
      !s.goal ||
      !s.workoutsPerWeek ||
      !s.hoursPerWeek ||
      !s.durationPreference ||
      (s.location !== "outdoors" && !s.equipment) || // relax equipment if outdoors
      !s.timeOfDay ||
      !s.location
    ) {
      navigate("/onboarding");
      return;
    }
    if (!Array.isArray(s.emphasis)) s.emphasis = [];
    setState(s);
  }, [navigate]);

  const tiles = useMemo<PlanTile[]>(() => {
    if (!state) return [];
    return generatePlanTiles(state);
  }, [state]);

  if (!state) return null;

  const emphasisText =
    state.emphasis.length > 0
      ? state.emphasis
          .map(
            (e) =>
              ((
                {
                  strength: "Strength & Muscle",
                  zone2: "Zone 2 Cardio",
                  hiit: "HIIT / VO₂ Max",
                  mobility: "Mobility / Prehab",
                  sleep: "Sleep Hygiene",
                  nutrition: "Nutrition Reset",
                  fat_loss: "Fat Loss",
                } as const
              )[e])
          )
          .join(" • ")
      : "—";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-black text-white">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="text-sm font-semibold tracking-tight">
            Your Weekly Plan Preview
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/15"
            asChild
          >
            <Link to="/onboarding">
              <PencilLine className="mr-2 h-4 w-4" />
              Edit choices
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Built for your goal
        </motion.h1>
        <p className="mt-1 text-sm text-white/80">
          We used your goal, availability, equipment and preferences to craft a
          high-leverage weekly plan. You can refine later with your Longevity
          Assessment.
        </p>

        {/* quick summary */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <SummaryItem label="Goal" value={readableGoal(state.goal)} />
          <SummaryItem
            label="Workouts / wk"
            value={String(state.workoutsPerWeek)}
          />
          <SummaryItem label="Hours / wk" value={`${state.hoursPerWeek} h`} />
          <SummaryItem label="Emphasis" value={emphasisText} />
        </div>

        {/* plan tiles */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          {tiles.map((t) => (
            <Card
              key={t.title}
              className="rounded-2xl border border-white/12 bg-white/10 shadow-lg shadow-black/40 backdrop-blur"
            >
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/16 text-white">
                    {t.icon}
                  </div>
                  <div className="text-lg font-semibold">{t.title}</div>
                </div>
                <ul className="grid gap-2">
                  {t.points.map((p, i) => (
                    <li
                      key={`${t.title}-${i}`}
                      className="flex items-start gap-2 text-sm text-white"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <span className="text-white/90">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-start gap-2 text-xs text-white/70">
                  <Info className="mt-0.5 h-3.5 w-3.5" />
                  <span>{t.why}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-white/70">
            You’ll get daily coaching nudges and auto-adjustments once you start
            your trial.
          </div>
          <Button
            className="rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-400 text-black hover:opacity-90"
            asChild
          >
            <Link to="/signup">
              Create my account (14-day trial)
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="text-xs text-white/70">
          Illustrative; individual results vary. This plan adapts after your
          first week of adherence.
        </div>
      </main>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
      <div className="text-xs text-white/70">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function readableGoal(goal: Goal | null): string {
  switch (goal) {
    case "all_round":
      return "Elite Stack";
    case "longevity_first":
      return "Built to Last";
    case "look_perform":
      return "Sculpt & Perform";
    case "cardio_engine":
      return "Cardiometabolic Health";
    default:
      return "—";
  }
}

function minutesFromPreference(pref: DurationPreference): number {
  return pref === "short" ? 30 : pref === "balanced" ? 45 : 60;
}

function generatePlanTiles(state: OnboardingState): PlanTile[] {
  const days = state.workoutsPerWeek ?? 3;
  const totalMinutes = (state.hoursPerWeek ?? 3) * 60; // authoritative
  const perSession = minutesFromPreference(
    state.durationPreference ?? "balanced"
  );
  // cap sessions by time budget
  const feasibleSessions = Math.min(
    days,
    Math.max(1, Math.floor(totalMinutes / (perSession * 0.8)))
  );
  const sessions = Math.max(1, feasibleSessions);

  const exp = state.experience ?? "beginner";
  const goal = state.goal ?? "all_round";
  const emphasis = new Set(state.emphasis ?? []);

  // Intensity scaler from experience & duration preference
  const intensity =
    (exp === "advanced" ? 1.15 : exp === "intermediate" ? 1.0 : 0.9) *
    (state.durationPreference === "long"
      ? 1.1
      : state.durationPreference === "short"
      ? 0.9
      : 1.0);

  // Base allocations (minutes) from time budget
  let zone2 = Math.round(totalMinutes * 0.45 * intensity);
  let hiit = Math.round(totalMinutes * 0.04 * intensity); // small slice
  let strengthMinutes = Math.round(totalMinutes * 0.38 * intensity);
  let mobilityMinutes = Math.round(totalMinutes * 0.13);

  // Goal biasing
  if (goal === "cardio_engine") {
    zone2 = Math.round(zone2 * 1.25);
    hiit = Math.round(hiit * 1.2);
    strengthMinutes = Math.round(strengthMinutes * 0.85);
  } else if (goal === "look_perform") {
    strengthMinutes = Math.round(strengthMinutes * 1.2);
    zone2 = Math.round(zone2 * 0.9);
  } else if (goal === "longevity_first") {
    zone2 = Math.round(zone2 * 1.15);
    hiit = Math.max(6, Math.round(hiit * 0.85));
    mobilityMinutes = Math.round(mobilityMinutes * 1.1);
  } else if (goal === "all_round") {
    // keep balanced; slight mobility bump to support volume
    mobilityMinutes = Math.round(mobilityMinutes * 1.05);
  }

  // Emphasis tweaks
  if (emphasis.has("zone2")) zone2 = Math.round(zone2 * 1.15);
  if (emphasis.has("hiit")) hiit = Math.round(Math.max(6, hiit * 1.2));
  if (emphasis.has("strength"))
    strengthMinutes = Math.round(strengthMinutes * 1.15);
  if (emphasis.has("mobility"))
    mobilityMinutes = Math.round(mobilityMinutes * 1.25);
  // Fat loss bias: more Zone2, daily steps, nutrition guardrails; preserve strength
  let addSteps = false;
  if (emphasis.has("fat_loss")) {
    zone2 = Math.round(zone2 * 1.2);
    hiit = Math.round(hiit * (exp !== "beginner" ? 1.1 : 1.0));
    strengthMinutes = Math.round(strengthMinutes * 1.05); // preserve lean mass
    addSteps = true;
  }

  // Convert strength minutes → sessions (approx 35–60 min blocks)
  const strengthPer = Math.min(60, Math.max(35, perSession));
  const strengthSessions = Math.max(
    1,
    Math.min(sessions, Math.round(strengthMinutes / strengthPer))
  );

  // Equipment-aware note
  const equipment =
    state.location === "outdoors" ? "none" : state.equipment ?? "minimal";
  const strengthNote =
    equipment === "none"
      ? "Bodyweight focus (squat, push-up, hinge, lunge, carry)."
      : equipment === "minimal"
      ? "Dumbbells/kettlebells + bodyweight."
      : "Barbell + machines + free weights.";

  // Sleep window suggestion
  const sleepWindow =
    state.timeOfDay === "morning"
      ? "22:30–06:30"
      : state.timeOfDay === "evening"
      ? "00:00–08:00"
      : "23:00–07:00";

  // Nutrition notes (fat loss bias modifies)
  const protein = emphasis.has("fat_loss")
    ? "1.8–2.2 g/kg/day"
    : "1.6–2.2 g/kg/day";
  const timing =
    goal === "longevity_first"
      ? "Evening carbs 2–3h pre-bed to aid sleep."
      : "Protein anchor each meal.";
  const deficit = emphasis.has("fat_loss")
    ? "Calorie deficit target ~0.5–1.0% body mass/week; ultra-processed < 20% of calories."
    : "Ultra-processed foods < 20% of calories.";

  const tiles: PlanTile[] = [
    {
      title: "Sleep",
      icon: <Moon className="h-5 w-5" />,
      points: [
        `Target window: ${sleepWindow}`,
        "2 pre-bed cues: lights down + no screens 45 min before.",
        "Wake anchor: same time even on weekends.",
      ],
      why: "Sleep drives recovery, hormones, decision-making, and training adaptation. A consistent window and simple cues raise sleep efficiency.",
    },
    {
      title: "Cardio",
      icon: <HeartPulse className="h-5 w-5" />,
      points: [
        `Zone 2: ~${Math.round(zone2)} min this week (split across ${Math.max(
          2,
          Math.round(sessions / 2)
        )} sessions).`,
        hiit > 0
          ? `HIIT: 1 × ${Math.max(6, Math.round(hiit))} min (short intervals).`
          : "HIIT: optional this week.",
        addSteps
          ? "Daily step goal: 8–12k steps."
          : "Optional: daily 20–30 min brisk walk.",
      ],
      why: "Zone 2 builds mitochondrial density and metabolic health. A small HIIT dose improves peak capacity without overloading recovery.",
    },
    {
      title: "Strength",
      icon: <Dumbbell className="h-5 w-5" />,
      points: [
        `${strengthSessions} sessions (full-body movement patterns).`,
        "RIR 1–3, progressive overload week to week.",
        strengthNote,
      ],
      why: "Strength training preserves muscle, bone density, and insulin sensitivity. Movement-pattern focus scales across equipment levels.",
    },
    {
      title: "Mobility & Prehab",
      icon: <Activity className="h-5 w-5" />,
      points: [
        `~${Math.round(
          mobilityMinutes
        )} min total. Micro-doses after sessions.`,
        "Target hips, T-spine, ankles; breathe-led tempo.",
        "Include balance & gait drills to support Zone 2.",
      ],
      why: "Mobility protects joints, improves mechanics, and sustains training volume. Small daily doses compound fast.",
    },
    {
      title: "Nutrition",
      icon: <Utensils className="h-5 w-5" />,
      points: [`Protein target: ${protein}`, timing, deficit],
      why: "Simple guardrails beat complex diets. Protein supports recovery; timing tweaks reinforce either performance or sleep focus.",
    },
  ];

  if (goal === "longevity_first") {
    tiles[0].points.unshift("Recovery bias: at least 1 full rest day.");
  }

  // Optional steps tile for visibility
  if (addSteps) {
    tiles.splice(2, 0, {
      title: "Daily Steps",
      icon: <Footprints className="h-5 w-5" />,
      points: [
        "8–12k steps most days.",
        "Use walks for low-stress Zone 2 accumulation.",
        "Short post-meal walks improve glucose response.",
      ],
      why: "Non-exercise activity drives energy expenditure and health with minimal recovery cost.",
    });
  }

  return tiles;
}
