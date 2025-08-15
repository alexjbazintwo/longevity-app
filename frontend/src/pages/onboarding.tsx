// src/pages/onboarding.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  HeartPulse,
  Moon,
  Sun,
  Timer,
  Home,
  Building2,
  MapPin,
  CalendarDays,
  Plus,
  Bandage,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  OnboardingState,
  Goal,
  Experience,
  Equipment,
  TimeOfDay,
  Location,
  DayOfWeek,
  Emphasis,
  DurationPreference,
  CommonInjury,
  SessionLength,
} from "@/types/onboarding";

// Background slides (Unsplash). Replace with local assets when ready.
const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop",
];

const STORAGE_KEY = "onboardingState";

// Emphasis defaults for each goal (includes fat_loss for aesthetics)
const EMPHASIS_DEFAULTS: Record<Goal, Emphasis[]> = {
  all_round: ["strength", "zone2", "hiit", "mobility", "sleep", "nutrition"],
  longevity_first: ["strength", "zone2", "mobility", "sleep", "nutrition"],
  look_perform: ["strength", "zone2", "sleep", "nutrition", "fat_loss"],
  cardio_engine: ["zone2", "hiit", "mobility", "sleep", "nutrition"],
};

const EMPHASIS_LABELS: Record<Emphasis, string> = {
  strength: "Strength & Muscle",
  zone2: "Zone 2 Cardio",
  hiit: "HIIT / VO₂ Max",
  mobility: "Mobility / Prehab",
  sleep: "Sleep Hygiene",
  nutrition: "Nutrition Reset",
  fat_loss: "Fat Loss",
};

// Micro “why this matters” (shown as title tooltips)
const EMPHASIS_COPY: Record<Emphasis, string> = {
  strength:
    "Preserves muscle/bone, drives insulin sensitivity and long-term function.",
  zone2:
    "Builds mitochondrial density and metabolic health; low fatigue, high ROI.",
  hiit: "Improves peak capacity and VO₂ max with minimal time investment.",
  mobility:
    "Protects joints, improves mechanics, enables higher training volume.",
  sleep: "Boosts recovery, hormones, decision-making, and adherence.",
  nutrition:
    "High-protein, minimally processed guardrails outperform complex diets.",
  fat_loss:
    "Sustainable deficit + protein, more Zone 2 & steps; protect muscle.",
};

// Updated goal options (Sleep removed, Cardio → Cardiometabolic Health)
const GOAL_OPTIONS: {
  key: Goal;
  title: string;
  desc: string;
  icon: ReactNode;
}[] = [
  {
    key: "all_round",
    title: "Elite Stack",
    desc: "Full-stack training for maximal gains — the pro route.",
    icon: <Plus className="h-5 w-5" />,
  },
  {
    key: "longevity_first",
    title: "Built to Last",
    desc: "All the benefits, recovery-first so you can keep it for life.",
    icon: <Timer className="h-5 w-5" />,
  },
  {
    key: "look_perform",
    title: "Sculpt & Perform",
    desc: "Lean out, build an athletic shape, and perform.",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    key: "cardio_engine",
    title: "Cardiometabolic Health",
    desc: "Improve VO₂ max, resting HR, and metabolic flexibility.",
    icon: <HeartPulse className="h-5 w-5" />,
  },
];

// Controls
const WORKOUTS_PER_WEEK = [1, 2, 3, 4, 5, 6];
const HOURS_PER_WEEK = [1, 2, 3, 4, 5, 6, 7, 8];
const DURATION_PREFS: {
  key: DurationPreference;
  label: string;
  hint: string;
}[] = [
  { key: "short", label: "Short & efficient", hint: "~25–35 min" },
  { key: "balanced", label: "Balanced", hint: "~35–50 min" },
  { key: "long", label: "Long & thorough", hint: "~50–70 min" },
];
const EQUIPMENT_OPTIONS: { key: Equipment; label: string }[] = [
  { key: "none", label: "No gear" },
  { key: "minimal", label: "Dumbbells/Kettlebells" },
  { key: "full_gym", label: "Full gym" },
];
const EXPERIENCE: Experience[] = ["beginner", "intermediate", "advanced"];
const TIMES: { key: TimeOfDay; label: string; icon: ReactNode }[] = [
  { key: "morning", label: "Morning", icon: <Sun className="h-4 w-4" /> },
  { key: "evening", label: "Evening", icon: <Moon className="h-4 w-4" /> },
  { key: "varies", label: "Varies", icon: <Timer className="h-4 w-4" /> },
];
const LOCATIONS: { key: Location; label: string; icon: ReactNode }[] = [
  { key: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { key: "gym", label: "Gym", icon: <Building2 className="h-4 w-4" /> },
  { key: "outdoors", label: "Outdoors", icon: <MapPin className="h-4 w-4" /> },
  { key: "mix", label: "Mix", icon: <CalendarDays className="h-4 w-4" /> },
];
const DOW: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const COMMON_INJURIES: { key: CommonInjury; label: string }[] = [
  { key: "shoulder", label: "Shoulder" },
  { key: "knee", label: "Knee" },
  { key: "lower_back", label: "Lower back" },
  { key: "elbow", label: "Elbow" },
  { key: "ankle", label: "Ankle" },
  { key: "hip", label: "Hip" },
  { key: "neck", label: "Neck" },
];

function defaultState(): OnboardingState {
  return {
    goal: null,
    experience: null,
    workoutsPerWeek: null,
    hoursPerWeek: null,
    durationPreference: null,
    equipment: null,
    injuries: "",
    commonInjuries: [],
    timeOfDay: null,
    location: null,
    daysOfWeek: [],
    emphasis: [],
  };
}

// Migration from old keys (daysPerWeek/sessionLength)
function migrate(
  old: Partial<
    OnboardingState & {
      daysPerWeek?: number | null;
      sessionLength?: SessionLength | null;
    }
  >
): OnboardingState {
  const next = defaultState();

  next.goal = old.goal ?? null;
  next.experience = old.experience ?? null;

  const workouts =
    (old as { workoutsPerWeek?: number | null }).workoutsPerWeek ??
    old.daysPerWeek ??
    null;
  next.workoutsPerWeek = workouts;

  let duration: DurationPreference | null = null;
  const sl =
    (old as { sessionLength?: SessionLength | null }).sessionLength ?? null;
  if (sl === "20" || sl === "30") duration = "short";
  if (sl === "45") duration = "balanced";
  if (sl === "60") duration = "long";
  next.durationPreference =
    (old as { durationPreference?: DurationPreference | null })
      .durationPreference ?? duration;

  const existingHours =
    (old as { hoursPerWeek?: number | null }).hoursPerWeek ?? null;
  if (existingHours != null) {
    next.hoursPerWeek = existingHours;
  } else if (workouts && duration) {
    const per = duration === "short" ? 30 : duration === "balanced" ? 45 : 60;
    next.hoursPerWeek = Math.round((workouts * per) / 60);
  } else {
    next.hoursPerWeek = null;
  }

  next.equipment = old.equipment ?? null;
  next.injuries = old.injuries ?? "";
  next.commonInjuries = Array.isArray(old.commonInjuries)
    ? old.commonInjuries
    : [];
  next.timeOfDay = old.timeOfDay ?? null;
  next.location = old.location ?? null;
  next.daysOfWeek = Array.isArray(old.daysOfWeek) ? old.daysOfWeek : [];
  next.emphasis = Array.isArray(old.emphasis) ? old.emphasis : [];

  return next;
}

function loadInitial(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OnboardingState> & {
        daysPerWeek?: number | null;
        sessionLength?: SessionLength | null;
      };
      return migrate(parsed);
    }
  } catch {
    // ignore
  }
  return defaultState();
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [state, setState] = useState<OnboardingState>(loadInitial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // background slideshow
  useEffect(() => {
    const id = setInterval(
      () => setActiveSlide((s) => (s + 1) % HERO_SLIDES.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // location → equipment convenience
  useEffect(() => {
    if (state.location === "gym" && !state.equipment) {
      setState((prev) => ({ ...prev, equipment: "full_gym" }));
    }
    if (state.location === "outdoors" && state.equipment) {
      setState((prev) => ({ ...prev, equipment: null }));
    }
  }, [state.location, state.equipment]);

  // helpers
  function setField<K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[String(key)];
      return copy;
    });
  }

  function handleGoalSelect(g: Goal) {
    setState((prev) => ({
      ...prev,
      goal: g,
      emphasis: EMPHASIS_DEFAULTS[g], // pre-fill, user can change
    }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.goal;
      return copy;
    });
  }

  function toggleArray<T>(arr: T[], value: T): T[] {
    const set = new Set(arr);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    return Array.from(set);
  }

  const steps = useMemo(
    () => [
      { title: "Goal", subtitle: "Pick your focus", index: 0 as const },
      { title: "Constraints", subtitle: "Time & equipment", index: 1 as const },
      { title: "Preferences", subtitle: "When & where", index: 2 as const },
    ],
    []
  );

  function validateStep(idx: 0 | 1 | 2): boolean {
    const e: Record<string, string> = {};
    if (idx === 0) {
      if (!state.goal) e.goal = "Select a goal.";
      if (!state.experience) e.experience = "Select your training experience.";
    }
    if (idx === 1) {
      if (!state.workoutsPerWeek)
        e.workoutsPerWeek = "Choose workouts per week.";
      if (!state.hoursPerWeek)
        e.hoursPerWeek = "Tell us your total hours per week.";
      if (!state.durationPreference)
        e.durationPreference = "Pick your duration preference.";
      // Equipment required unless location is outdoors (unknown yet on step 1; still ask)
      if (!state.equipment) e.equipment = "Choose your available equipment.";
    }
    if (idx === 2) {
      if (!state.timeOfDay) e.timeOfDay = "Choose a time of day.";
      if (!state.location) e.location = "Choose a location.";
    }
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  }

  function next() {
    // On submit from last step, relax equipment requirement if outdoors
    if (step === 2 && state.location === "outdoors") {
      // clear any prior equipment error
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.equipment;
        return copy;
      });
    }
    if (!validateStep(step)) return;
    if (step < 2) setStep((s) => (s + 1) as 0 | 1 | 2);
    else navigate("/plan-preview");
  }

  function back() {
    if (step > 0) setStep((s) => (s - 1) as 0 | 1 | 2);
  }

  const progressPct = ((step + 1) / 3) * 100;

  return (
    <div className="relative isolate min-h-screen bg-black text-white">
      {/* Background slideshow + readability overlays */}
      <div className="absolute inset-0 overflow-hidden">
        {HERO_SLIDES.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: activeSlide === i ? 1 : 0,
              scale: activeSlide === i ? 1 : 1.05,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/72 to-black/88" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-teal-500/25 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-[80vw] -translate-x-1/2 rounded-[48px] bg-black/30 backdrop-blur-md" />
      </div>

      {/* Content */}
      <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-8">
        {/* Mini-hero */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Let’s build your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400">
                perfect weekly plan
              </span>
            </motion.h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85">
              Three quick steps. Your plan adapts weekly to your progress,
              schedule and recovery.
            </p>
          </div>
          {/* Step chips */}
          <div className="hidden items-center gap-2 sm:flex">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset ${
                  i === step
                    ? "bg-white/20 text-white ring-white/30"
                    : i < step
                    ? "bg-emerald-400/25 text-emerald-100 ring-emerald-300/40"
                    : "bg-white/12 text-white/80 ring-white/20"
                }`}
              >
                {s.title}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/15"
          aria-label="Progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-4">
          {/* STEP 0 */}
          {step === 0 && (
            <>
              <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                    Primary outcome
                    <span
                      className="inline-flex"
                      title="Choose your main reason for being here. You can still fine-tune with emphases."
                    >
                      <Info
                        className="h-3.5 w-3.5 text-white/70"
                        aria-label="info"
                      />
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {GOAL_OPTIONS.map((g) => {
                      const active = state.goal === g.key;
                      return (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => handleGoalSelect(g.key)}
                          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                            active
                              ? "border-emerald-300/70 bg-emerald-400/15 ring-1 ring-inset ring-emerald-300/50"
                              : "border-white/22 bg-white/8 hover:bg-white/14"
                          }`}
                          aria-pressed={active}
                        >
                          <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl bg-white/16 text-white">
                            {g.icon}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {g.title}
                            </div>
                            <div className="text-sm text-white/85">
                              {g.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.goal && (
                    <p className="mt-2 text-sm text-red-300">{errors.goal}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      Emphasis (optional)
                      <span
                        className="inline-flex"
                        title="We’ll pre-select these by your goal. Toggle to bias your plan."
                      >
                        <Info
                          className="h-3.5 w-3.5 text-white/70"
                          aria-label="info"
                        />
                      </span>
                    </div>
                    <div className="text-[11px] text-white/70">
                      Pre-selected for your goal — tweak as you like.
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(EMPHASIS_LABELS) as Emphasis[]).map((e) => {
                      const active = state.emphasis.includes(e);
                      return (
                        <button
                          key={e}
                          type="button"
                          onClick={() =>
                            setField("emphasis", toggleArray(state.emphasis, e))
                          }
                          className={`rounded-xl border px-3 py-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                            active
                              ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                              : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                          }`}
                          aria-pressed={active}
                          title={EMPHASIS_COPY[e]}
                        >
                          {EMPHASIS_LABELS[e]}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                    Training experience
                    <span
                      className="inline-flex"
                      title="We scale intensity, complexity and progression to your level."
                    >
                      <Info
                        className="h-3.5 w-3.5 text-white/70"
                        aria-label="info"
                      />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE.map((e) => {
                      const active = state.experience === e;
                      return (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setField("experience", e)}
                          className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                            active
                              ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                              : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                          }`}
                          aria-pressed={active}
                        >
                          {e[0].toUpperCase() + e.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                  {errors.experience && (
                    <p className="mt-2 text-sm text-red-300">
                      {errors.experience}
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                    Workouts per week
                    <span
                      className="inline-flex"
                      title="We’ll distribute strength/cardio sessions across your week."
                    >
                      <Info
                        className="h-3.5 w-3.5 text-white/70"
                        aria-label="info"
                      />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {WORKOUTS_PER_WEEK.map((d) => {
                      const active = state.workoutsPerWeek === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setField("workoutsPerWeek", d)}
                          className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                            active
                              ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                              : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                          }`}
                          aria-pressed={active}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                  {errors.workoutsPerWeek && (
                    <p className="mt-2 text-sm text-red-300">
                      {errors.workoutsPerWeek}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                      Hours per week (total)
                      <span
                        className="inline-flex"
                        title="The main constraint. We’ll fit the plan to this time budget."
                      >
                        <Info
                          className="h-3.5 w-3.5 text-white/70"
                          aria-label="info"
                        />
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {HOURS_PER_WEEK.map((h) => {
                        const active = state.hoursPerWeek === h;
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setField("hoursPerWeek", h)}
                            className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                              active
                                ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                                : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                            }`}
                            aria-pressed={active}
                          >
                            {h} h
                          </button>
                        );
                      })}
                    </div>
                    {errors.hoursPerWeek && (
                      <p className="mt-2 text-sm text-red-300">
                        {errors.hoursPerWeek}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                      Duration preference
                      <span
                        className="inline-flex"
                        title="Shorter sessions pack density; longer allow more accessories or cardio."
                      >
                        <Info
                          className="h-3.5 w-3.5 text-white/70"
                          aria-label="info"
                        />
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_PREFS.map((p) => {
                        const active = state.durationPreference === p.key;
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() =>
                              setField("durationPreference", p.key)
                            }
                            className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                              active
                                ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                                : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                            }`}
                            aria-pressed={active}
                          >
                            {p.label}{" "}
                            <span className="ml-1 text-xs text-white/70">
                              ({p.hint})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.durationPreference && (
                      <p className="mt-2 text-sm text-red-300">
                        {errors.durationPreference}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Available Equipment (hidden if Outdoors) */}
              {state.location !== "outdoors" && (
                <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                      Available equipment
                      <span
                        className="inline-flex"
                        title="We’ll pick exercises that match what you’ve got access to."
                      >
                        <Info
                          className="h-3.5 w-3.5 text-white/70"
                          aria-label="info"
                        />
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_OPTIONS.map((eq) => {
                        const active = state.equipment === eq.key;
                        return (
                          <button
                            key={eq.key}
                            type="button"
                            onClick={() => setField("equipment", eq.key)}
                            className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                              active
                                ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                                : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                            }`}
                            aria-pressed={active}
                          >
                            {eq.label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.equipment && (
                      <p className="mt-2 text-sm text-red-300">
                        {errors.equipment}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Injuries: quick chips + optional free text */}
              <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Bandage className="h-4 w-4" />
                    Known injuries or constraints (optional)
                    <span
                      className="inline-flex"
                      title="We’ll auto-swap exercises and set safe ranges of motion."
                    >
                      <Info
                        className="h-3.5 w-3.5 text-white/70"
                        aria-label="info"
                      />
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {COMMON_INJURIES.map((inj) => {
                      const active = (state.commonInjuries ?? []).includes(
                        inj.key
                      );
                      return (
                        <button
                          key={inj.key}
                          type="button"
                          onClick={() =>
                            setField(
                              "commonInjuries",
                              toggleArray(state.commonInjuries, inj.key)
                            )
                          }
                          className={`rounded-xl border px-3 py-1.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                            active
                              ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                              : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                          }`}
                          aria-pressed={active}
                        >
                          {inj.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                    placeholder="Add details (e.g., left knee—avoid deep flexion; shoulder overhead painful)"
                    value={state.injuries ?? ""}
                    onChange={(e) => setField("injuries", e.target.value)}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                    Time of day
                    <span
                      className="inline-flex"
                      title="We’ll bias your schedule and sleep cues toward this window."
                    >
                      <Info
                        className="h-3.5 w-3.5 text-white/70"
                        aria-label="info"
                      />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TIMES.map((t) => {
                      const active = state.timeOfDay === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setField("timeOfDay", t.key)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                            active
                              ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                              : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                          }`}
                          aria-pressed={active}
                        >
                          {t.icon}
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.timeOfDay && (
                    <p className="mt-2 text-sm text-red-300">
                      {errors.timeOfDay}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                    Location
                    <span
                      className="inline-flex"
                      title="We’ll tailor exercise selection and scheduling to this."
                    >
                      <Info
                        className="h-3.5 w-3.5 text-white/70"
                        aria-label="info"
                      />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((l) => {
                      const active = state.location === l.key;
                      return (
                        <button
                          key={l.key}
                          type="button"
                          onClick={() => setField("location", l.key)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                            active
                              ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                              : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                          }`}
                          aria-pressed={active}
                        >
                          {l.icon}
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-300">
                      {errors.location}
                    </p>
                  )}
                </CardContent>
              </Card>

              {(state.workoutsPerWeek ?? 0) >= 3 && (
                <Card className="rounded-2xl border border-white/22 bg-white/12 shadow-lg shadow-black/40 backdrop-blur-md">
                  <CardContent className="p-5">
                    <div className="mb-3 text-sm font-medium text-white">
                      Days you prefer (optional)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {DOW.map((d) => {
                        const active = (state.daysOfWeek ?? []).includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() =>
                              setField(
                                "daysOfWeek",
                                toggleArray(state.daysOfWeek, d)
                              )
                            }
                            className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 ${
                              active
                                ? "border-emerald-300/70 bg-emerald-400/15 text-emerald-100"
                                : "border-white/22 bg-white/10 text-white hover:bg-white/16"
                            }`}
                            aria-pressed={active}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-white/80">
                      Leave blank to auto-schedule across the week.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Nav */}
        <div className="mt-8 grid grid-cols-2 items-center gap-3">
          <div>
            {step > 0 && (
              <Button
                variant="outline"
                className="rounded-xl border-cyan-300/50 bg-cyan-300/20 text-white hover:bg-cyan-300/25 focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                onClick={back}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              className="rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-400 text-black hover:opacity-90 focus-visible:ring-2 focus-visible:ring-emerald-300/60"
              onClick={next}
            >
              {step < 2 ? (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  See my weekly plan <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator className="my-8 bg-white/15" />
        <div className="text-xs text-white/80">
          You can refine your plan later with the Longevity Assessment for even
          better accuracy.
        </div>
      </main>
    </div>
  );
}
