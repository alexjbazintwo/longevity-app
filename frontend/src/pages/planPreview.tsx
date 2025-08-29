// src/pages/planPreview.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactElement,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Dumbbell,
  Flame,
  Info,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingOverlay from "@/components/ui/loadingOverlay";
import { cn } from "@/utils";
import { getPlanPreview } from "@/api/planApi";
import type {
  PlanResponseV1,
  WeekV1,
  ZonesV1,
  DayV1,
  WorkoutV1,
} from "@/types/plan";

/* ---------- helpers ---------- */

type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const WEEK_DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function secToMMSS(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function unitSuffix(unit: "km" | "mi"): "/km" | "/mi" {
  return unit === "km" ? "/km" : "/mi";
}

type ItemKind = "run" | "strength" | "rest" | "mobility" | "cross" | "rehab";
function kindIcon(kind: ItemKind): ReactElement {
  if (kind === "strength" || kind === "mobility" || kind === "cross") {
    return <Dumbbell className="h-4 w-4" />;
  }
  if (kind === "rehab") return <Info className="h-4 w-4" />;
  if (kind === "rest") return <Check className="h-4 w-4" />;
  return <Flame className="h-4 w-4" />;
}

/* ---------- global guidance (rephrased, consistent) ---------- */

const EFFORT_GUIDANCE =
  "Use perceived effort as your primary guide; heart rate and pace vary with terrain, weather, and recovery." as const;

/* ---------- zone descriptors, actions, perceived effort cues ---------- */

type ZoneKey = "Z1" | "Z2" | "Z3" | "Z4" | "Z5";

const ZONE_DISPLAY: Record<ZoneKey, string> = {
  Z1: "Recovery / Easy Aerobic",
  Z2: "Easy / Aerobic Base",
  Z3: "Tempo / Steady",
  Z4: "Threshold",
  Z5: "VO₂max",
};

const COACH_ACTIONS: Record<ZoneKey, string> = {
  Z1: "Super easy rhythm; move blood without strain to aid recovery.",
  Z2: "Steady, smooth breathing; build volume.",
  Z3: "Controlled, sustained rhythm; stay just below threshold.",
  Z4: "Crisp but controlled; focus on economy at threshold.",
  Z5: "Fast, powerful reps; take full recoveries between intervals.",
};

const PERCEIVED_EFFORT: Record<ZoneKey, string> = {
  Z1: "All-day easy and fully conversational; true recovery jogging.",
  Z2: "Easy–steady; you can speak in full sentences. Nose-only breathing is just about sustainable (borderline).",
  Z3: "‘Tempo/steady’ below threshold; short sentences talking pace; strong but sustainable.",
  Z4: "Near your threshold; hard but controlled; you can only speak a few words.",
  Z5: "Very hard VO₂max work; breathing and effort are maximal during short reps; no talking.",
};

/* ---------- small components ---------- */

function FocusBadge({ children }: { children: string }) {
  return (
    <Badge className="rounded-full bg-indigo-500/10 px-3 py-1 text-white ring-1 ring-indigo-400/20">
      {children}
    </Badge>
  );
}

function WeekTab({
  index,
  active,
  locked,
  onClick,
  disabled = false,
  opacity,
}: {
  index: number;
  active: boolean;
  locked: boolean;
  onClick: () => void;
  disabled?: boolean;
  opacity?: number;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? () => {} : onClick}
      className={cn(
        "group relative rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-white/10 text-white ring-1 ring-white/15"
          : "text-white/70 hover:bg-white/5 hover:text-white",
        disabled ? "cursor-not-allowed" : ""
      )}
      aria-pressed={active}
      aria-disabled={disabled}
      style={opacity !== undefined ? { opacity } : undefined}
    >
      <span className="font-medium">Week {index}</span>
      {locked && (
        <Lock
          className="ml-1 inline h-3.5 w-3.5 opacity-80"
          aria-hidden="true"
        />
      )}
      {active && (
        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300" />
      )}
    </button>
  );
}

function EmptyDrop({
  isOver,
  onDragOver,
  onDrop,
}: {
  isOver: boolean;
  onDragOver: () => void;
  onDrop: (payload: { id: string }) => void;
}) {
  return (
    <div
      className={cn(
        "grid min-h-[110px] place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-3 text-center text-xs leading-5 text-white/80",
        isOver ? "ring-2 ring-emerald-300/60 bg-white/[0.06]" : ""
      )}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("application/json");
        try {
          const parsed = JSON.parse(raw) as { id: string };
          if (parsed && parsed.id) onDrop(parsed);
        } catch {
          /* ignore */
        }
      }}
    >
      Drop a workout here
    </div>
  );
}

/* Zone chip kept minimal; details appear in the side panel on click */
function ZoneChip({
  z,
  zones,
  unitPref,
}: {
  z: ZoneKey;
  zones: ZonesV1;
  unitPref: "km" | "mi";
}) {
  const band = zones.bands[z];
  const paceText =
    unitPref === "km"
      ? `${secToMMSS(band.min_s_per_km)}–${secToMMSS(
          band.max_s_per_km
        )}${unitSuffix("km")}`
      : `${secToMMSS(band.min_s_per_mi)}–${secToMMSS(
          band.max_s_per_mi
        )}${unitSuffix("mi")}`;

  return (
    <span
      className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] text-white ring-1 ring-indigo-400/20"
      title={`${z} — ${ZONE_DISPLAY[z]} • HR ${band.hr_pct_low}–${band.hr_pct_high}% • Pace ${paceText}`}
    >
      {z}
    </span>
  );
}

/* ---------- mapping helpers from API -> UI ---------- */

type PlanItem = {
  id: string;
  dow: Weekday;
  title: string;
  kind: ItemKind;
  primary: string;
  detail?: string;
  zoneKey?: ZoneKey;
  tags?: string[];
};

function mapWeekToSchedule(week: WeekV1): Record<Weekday, PlanItem[]> {
  const map: Record<Weekday, PlanItem[]> = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  };

  week.days.forEach((d: DayV1) => {
    if (d.status === "rest" || d.workouts.length === 0) {
      map[d.dow as Weekday].push({
        id: `${week.index}-${d.dow}-rest`,
        dow: d.dow as Weekday,
        title: "Rest",
        kind: "rest",
        primary: d.notes ?? "Rest / Optional easy walk or mobility",
      });
      return;
    }

    d.workouts.forEach((w: WorkoutV1) => {
      switch (w.kind) {
        case "run": {
          const z = w.zone ?? undefined;
          const dur = w.duration_min ? `${w.duration_min} min` : "";
          const primary =
            (w.primary ?? "").trim() ||
            [dur, z ? `• ${z}` : undefined].filter(Boolean).join(" ").trim();

          map[d.dow as Weekday].push({
            id: w.id,
            dow: d.dow as Weekday,
            title: w.title,
            kind: "run",
            primary,
            detail: w.notes,
            zoneKey: z,
            tags: w.tags,
          });
          break;
        }

        case "strength": {
          const dur = w.duration_min ? `${w.duration_min} min` : "";
          map[d.dow as Weekday].push({
            id: w.id,
            dow: d.dow as Weekday,
            title: w.title,
            kind: "strength",
            primary: [dur, "• Strength"].filter(Boolean).join(" "),
            detail: w.notes,
            tags: w.tags,
          });
          break;
        }

        case "mobility": {
          const dur = w.duration_min ? `${w.duration_min} min` : "";
          map[d.dow as Weekday].push({
            id: w.id,
            dow: d.dow as Weekday,
            title: w.title,
            kind: "mobility",
            primary: [dur, "• Mobility"].filter(Boolean).join(" "),
            detail: w.notes,
            tags: w.tags,
          });
          break;
        }

        case "cross": {
          const dur = w.duration_min ? `${w.duration_min} min` : "";
          map[d.dow as Weekday].push({
            id: w.id,
            dow: d.dow as Weekday,
            title: w.title,
            kind: "cross",
            primary: [dur, "• Cross-training"].filter(Boolean).join(" "),
            detail: w.notes,
            tags: w.tags,
          });
          break;
        }

        case "rehab": {
          const dur = w.duration_min ? `${w.duration_min} min` : "";
          map[d.dow as Weekday].push({
            id: w.id,
            dow: d.dow as Weekday,
            title: w.title,
            kind: "rehab",
            primary: [dur, "• Rehab"].filter(Boolean).join(" "),
            detail: w.notes,
            tags: w.tags,
          });
          break;
        }

        default: {
          const _exhaustive: never = w;
          void _exhaustive;
          return;
        }
      }
    });
  });

  return map;
}

/* ---------- lock overlay ---------- */

function LockOverlay({ onAction }: { onAction: () => void }) {
  return (
    <Card className="rounded-2xl border-white/10 bg-white/5 ring-1 ring-white/10 backdrop-blur">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
            <Lock className="h-5 w-5" />
          </span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-white">Weeks locked</div>
          <div className="text-sm text-white/80">
            Unlock all weeks to view and customise the full program.
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            className="rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black"
          >
            <Link to="/setup">Unlock & get started</Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/15 bg-transparent hover:bg-white/10 text-white"
            onClick={onAction}
          >
            Compare plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- full zone guide modal ---------- */

type GuideRow = {
  z: ZoneKey;
  i: "I-1" | "I-2" | "I-3" | "I-4" | "I-5";
  name: string;
  use: string;
  purpose: string;
  effort: string; // perceived effort
  hrPct: string;
  lactate: string;
  sources: string[];
};

const ZONE_GUIDE: ReadonlyArray<GuideRow> = [
  {
    z: "Z1",
    i: "I-1",
    name: "Recovery / Easy Aerobic",
    use: "Warm-up, cool-down, easy days, technique drills, very easy jogs.",
    purpose:
      "Aerobic base, blood flow, capillarization; very low stress; primes recovery.",
    effort: "All-day easy and fully conversational; true recovery jogging.",
    hrPct: "~55–72%",
    lactate: "~0.5–1.5 mmol/L",
    sources: ["olt-skala.nif.no"],
  },
  {
    z: "Z2",
    i: "I-2",
    name: "Easy / Aerobic Base",
    use: "Long steady runs; steady endurance blocks; aerobic mileage.",
    purpose:
      "Peripheral aerobic adaptations, fat oxidation, mitochondrial biogenesis.",
    effort:
      "Easy–steady; you can speak in full sentences. Nose-only breathing is just about sustainable (borderline).",
    hrPct: "~72–82%",
    lactate: "~1.0–2.0 mmol/L",
    sources: ["olt-skala.nif.no"],
  },
  {
    z: "Z3",
    i: "I-3",
    name: "Tempo / Steady (sub-threshold)",
    use: "Continuous or long intervals.",
    purpose:
      "Near-threshold aerobic work; central + peripheral adaptations; speed endurance.",
    effort:
      "Short-sentence talking pace; strong but sustainable below threshold.",
    hrPct: "~82–87%",
    lactate: "~1.5–3.5 mmol/L (LT1↔LT2 band)",
    sources: ["olt-skala.nif.no", "Distance Running Lab"],
  },
  {
    z: "Z4",
    i: "I-4",
    name: "Threshold",
    use: "Long intervals or sustained efforts near LT2.",
    purpose:
      "Raise/maintain velocity at LT; lactate transport/clearance; neuromuscular economy.",
    effort: "Hard but controlled; only a few words possible.",
    hrPct: "~87–92%",
    lactate: "~3–4+ mmol/L (individual)",
    sources: ["olt-skala.nif.no", "Frontiers"],
  },
  {
    z: "Z5",
    i: "I-5",
    name: "VO₂max / Very Hard",
    use: "Short intervals with ample recovery.",
    purpose:
      "Maximal aerobic power, stroke volume; lactate tolerance; neural drive.",
    effort:
      "3–5K interval effort for 1–5 min reps; breathing/effort maximal; no talking.",
    hrPct: "~92–100%",
    lactate: "High, task-dependent",
    sources: ["olt-skala.nif.no", "High North Performance"],
  },
] as const;

function ZoneGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-[71] w-[min(100vw-2rem,780px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/95 p-4 text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Training zone guide"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/70">
              Training zones
            </div>
            <div className="mt-1 text-lg font-semibold">
              Full explanation (Z1–Z5 / I-1–I-5)
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/10"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="my-3 bg-white/10" />

        <div className="mb-4 rounded-xl bg-white/5 p-3 text-sm ring-1 ring-white/10">
          <div className="font-medium">How to use this</div>
          <div className="mt-1 text-white/85">
            {EFFORT_GUIDANCE} Let the perceived-effort cues below be your main
            reference; adjust heart rate and pace targets accordingly.
          </div>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          {ZONE_GUIDE.map((row) => (
            <div
              key={row.z}
              className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {row.z} — {row.name}
                </div>
                <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] ring-1 ring-indigo-400/20">
                  {row.i}
                </span>
              </div>
              <div className="mt-1 text-white/85">{row.use}</div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-white/70">Purpose</div>
                  <div className="text-white">{row.purpose}</div>
                </div>
                <div>
                  <div className="text-white/70">Perceived effort</div>
                  <div className="text-white">{row.effort}</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-white/70">HR (of max)</div>
                  <div className="text-white">{row.hrPct}</div>
                </div>
                <div>
                  <div className="text-white/70">Lactate</div>
                  <div className="text-white">{row.lactate}</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-white/60">
                Sources: {row.sources.join(", ")}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-[11px] leading-snug text-white/60">
          Notes: HR zones assume a standard HRmax estimate; individual variation
          is significant. Paces depend on terrain and conditions. Adjust up/down
          based on readiness and mechanics on the day.
        </div>
      </div>
    </>
  );
}

/* ---------- page ---------- */

export default function PlanPreview() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const forceSlow = params.get("slow") === "1";

  const [loading, setLoading] = useState<boolean>(true);
  const [plan, setPlan] = useState<PlanResponseV1 | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [showWhy, setShowWhy] = useState<boolean>(true);
  const [hoverDay, setHoverDay] = useState<Weekday | null>(null);
  const [unitPref, setUnitPref] = useState<"km" | "mi">("km");

  // detail overlay & guide state
  const [detailItem, setDetailItem] = useState<PlanItem | null>(null);
  const [showZoneGuide, setShowZoneGuide] = useState<boolean>(false);
  const draggingRef = useRef<boolean>(false);

  const zones: ZonesV1 | null = plan ? plan.zones : null;

  useEffect(() => {
    let mounted = true;
    const demo = params.get("demo") === "1";
    (async () => {
      setLoading(true);
      try {
        const resp = await getPlanPreview({ demo });
        if (!mounted) return;
        setPlan(resp);
        const raw = localStorage.getItem("wiz_answers");
        if (raw) {
          const a = JSON.parse(raw) as Record<string, unknown>;
          const u = a["units"];
          if (u === "km" || u === "mi") setUnitPref(u);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  const activeWeek: WeekV1 | null = useMemo(() => {
    if (!plan) return null;
    const idx = Math.max(0, Math.min(plan.weeks.length - 1, activeIdx));
    return plan.weeks[idx];
  }, [plan, activeIdx]);

  /* schedule state for DnD */
  const [scheduleByDay, setScheduleByDay] = useState<Record<
    Weekday,
    PlanItem[]
  > | null>(null);

  useEffect(() => {
    if (!activeWeek) {
      setScheduleByDay(null);
      return;
    }
    setScheduleByDay(mapWeekToSchedule(activeWeek));
  }, [activeWeek]);

  const moveItem = (id: string, toDay: Weekday): void => {
    setScheduleByDay((prev) => {
      if (!prev) return prev;
      let foundDay: Weekday | null = null;
      let foundItem: PlanItem | null = null;

      for (const wd of WEEK_DAYS) {
        const idx = prev[wd].findIndex((x) => x.id === id);
        if (idx >= 0) {
          foundDay = wd;
          foundItem = prev[wd][idx];
          break;
        }
      }
      if (!foundDay || !foundItem || foundDay === toDay) return prev;

      const next: Record<Weekday, PlanItem[]> = {
        Mon: [...prev.Mon],
        Tue: [...prev.Tue],
        Wed: [...prev.Wed],
        Thu: [...prev.Thu],
        Fri: [...prev.Fri],
        Sat: [...prev.Sat],
        Sun: [...prev.Sun],
      };
      next[foundDay] = next[foundDay].filter((x) => x.id !== id);
      next[toDay] = [...next[toDay], { ...foundItem, dow: toDay }];
      return next;
    });
  };

  const showLoader = loading || forceSlow;

  return (
    <div className="relative isolate min-h-[calc(100vh-64px)] bg-[#0b1026]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1026] via-[#0b1026] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_-6%,rgba(251,191,36,0.14),transparent_40%),radial-gradient(800px_420px_at_90%_-4%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(900px_520px_at_75%_90%,rgba(16,185,129,0.16),transparent_42%)]" />
      </div>

      <LoadingOverlay
        show={showLoader}
        title="Building your adaptive plan…"
        subtitle="Calibrating paces, load & recovery."
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/75">
              AI-tuned plan preview
            </div>
            <h1 className="mt-2 bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              {plan?.summary.headline ?? "Your plan"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FocusBadge>Drag & drop days</FocusBadge>
            <FocusBadge>Adaptive</FocusBadge>
            <FocusBadge>Deload aware</FocusBadge>
          </div>
        </div>

        {/* Why this plan (dismissible) */}
        {showWhy && plan?.summary.rationale && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-cyan-400/10 to-emerald-400/10 p-4 ring-1 ring-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white">Why you’re seeing this plan</div>
                <div className="mt-1 text-sm text-white/80">
                  {plan.summary.rationale}
                </div>
                <div className="mt-2 text-[11px] text-white/70">
                  Tip: Drag any workout to a different day. Drop targets
                  highlight in green.
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-white/15 bg-transparent hover:bg-white/10 text-white"
                onClick={() => setShowWhy(false)}
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}

        {/* Week tabs */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Real preview weeks (clickable) */}
          {plan?.weeks.map((w) => (
            <WeekTab
              key={w.index}
              index={w.index + 1}
              active={activeIdx === w.index}
              locked={w.locked}
              onClick={() => setActiveIdx(w.index)}
            />
          ))}

          {/* Locked ghost tabs (Weeks 3–7), progressively faded */}
          {plan &&
            (() => {
              const previewCount = plan.weeks.length;
              const GHOST_TAB_COUNT = 5; // next 5 weeks (e.g., 3–7)
              const opStart = 0.7;
              const opEnd = 0.15;
              const opStep =
                GHOST_TAB_COUNT > 1
                  ? (opStart - opEnd) / (GHOST_TAB_COUNT - 1)
                  : 0;

              return Array.from({ length: GHOST_TAB_COUNT }, (_, i) => {
                const idxLabel = previewCount + (i + 1); // human label
                const opacity = Math.max(opEnd, opStart - i * opStep);
                return (
                  <WeekTab
                    key={`ghost-${idxLabel}`}
                    index={idxLabel}
                    active={false}
                    locked={true}
                    disabled={true}
                    opacity={opacity}
                    onClick={() => {}}
                  />
                );
              });
            })()}
        </div>

        {/* Week summary */}
        {plan && plan.weeks[activeIdx] && (
          <Card className="mb-4 rounded-2xl border-white/10 bg-white/5 ring-1 ring-white/10 backdrop-blur">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-white">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="text-sm">
                  <div className="font-medium">Week {activeIdx + 1}</div>
                  <div className="text-white/80">
                    {plan.weeks[activeIdx].focus ??
                      "Balanced, adaptable training"}
                  </div>
                </div>
              </div>
              <Separator className="bg-white/10 sm:hidden" />
              <div className="flex items-center gap-2 text-white">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
                  <Flame className="h-4 w-4" />
                </span>
                <div className="text-sm">
                  <div className="font-medium">Planned Volume</div>
                  <div className="text-white/80">
                    {plan.weeks[activeIdx].volume_km
                      ? `${plan.weeks[activeIdx].volume_km} km`
                      : "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  className="rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black"
                >
                  <Link to="/setup">Personalise further</Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-white/15 bg-transparent hover:bg-white/10 text-white"
                >
                  Export (locked)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7-day grid */}
        {activeWeek ? (
          activeWeek.locked ? (
            <div className="mt-2">
              <LockOverlay onAction={() => {}} />
            </div>
          ) : (
            scheduleByDay && (
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
                {WEEK_DAYS.map((wd) => {
                  const items = scheduleByDay[wd] ?? [];
                  const isOver = hoverDay === wd;
                  return (
                    <div
                      key={wd}
                      className={cn(
                        "rounded-2xl border border-white/10 bg-white/[0.04] p-3 ring-1 ring-white/10 backdrop-blur",
                        isOver
                          ? "ring-2 ring-emerald-300/60 bg-white/[0.06]"
                          : ""
                      )}
                      onDragOver={(e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        setHoverDay(wd);
                      }}
                      onDragEnter={(e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        setHoverDay(wd);
                      }}
                      onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (
                          e.clientX < rect.left ||
                          e.clientX > rect.right ||
                          e.clientY < rect.top ||
                          e.clientY > rect.bottom
                        ) {
                          setHoverDay((cur) => (cur === wd ? null : cur));
                        }
                      }}
                      onDrop={(e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        const raw = e.dataTransfer.getData("application/json");
                        try {
                          const parsed = JSON.parse(raw) as { id: string };
                          if (parsed && parsed.id) moveItem(parsed.id, wd);
                        } catch {
                          /* ignore */
                        }
                        setHoverDay(null);
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs uppercase tracking-wider text-white/80">
                          {wd}
                        </div>
                        <div className="text-[10px] text-white/60">
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {items.map((it) => (
                          <motion.div
                            key={it.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              className="overflow-hidden rounded-2xl border-white/10 bg-white/5 ring-1 ring-white/10 backdrop-blur"
                              draggable
                              onDragStart={(e: DragEvent<HTMLDivElement>) => {
                                draggingRef.current = true;
                                e.dataTransfer.setData(
                                  "application/json",
                                  JSON.stringify({ id: it.id })
                                );
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragEnd={() => {
                                draggingRef.current = false;
                              }}
                              onClick={() => {
                                if (draggingRef.current) {
                                  draggingRef.current = false;
                                  return;
                                }
                                setDetailItem(it);
                              }}
                            >
                              <CardContent className="cursor-grab p-4 active:cursor-grabbing">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-xs uppercase tracking-wide text-white/70">
                                      {wd}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-white">
                                      <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10">
                                        {kindIcon(it.kind)}
                                      </span>
                                      <div className="truncate text-sm font-medium">
                                        {it.title}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="shrink-0 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-indigo-500/10 px-2 py-1 text-xs text-white ring-1 ring-indigo-400/20"
                                    title={it.primary}
                                  >
                                    {it.primary}
                                  </div>
                                </div>

                                {it.detail && (
                                  <div className="mt-2 text-sm text-white/85">
                                    {it.detail}
                                  </div>
                                )}

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  {it.zoneKey && zones && (
                                    <ZoneChip
                                      z={it.zoneKey}
                                      zones={zones}
                                      unitPref={unitPref}
                                    />
                                  )}
                                  {it.tags?.map((t) => (
                                    <span
                                      key={t}
                                      className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/80 ring-1 ring-white/10"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}

                        {items.length === 0 && (
                          <EmptyDrop
                            isOver={isOver}
                            onDragOver={() => setHoverDay(wd)}
                            onDrop={(payload) => {
                              moveItem(payload.id, wd);
                              setHoverDay(null);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )
        ) : null}

        {/* Sales CTA */}
        {plan && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-cyan-400/10 to-emerald-400/10 p-6 ring-1 ring-white/10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="text-white">
                  Get your full adaptive program — all weeks unlocked
                </div>
                <div className="mt-1 text-sm text-white/80">
                  Smart paces, fatigue checks, deloads, and race-week cues.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-white/10 text-white ring-1 ring-white/10">
                    Weekly adjustments
                  </Badge>
                  <Badge className="rounded-full bg-white/10 text-white ring-1 ring-white/10">
                    Calendar export
                  </Badge>
                  <Badge className="rounded-full bg-white/10 text-white ring-1 ring-white/10">
                    Strength add-ons
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  asChild
                  className="rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black"
                >
                  <Link to="/setup">Unlock & get started</Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-white/15 bg-transparent hover:bg-white/10 text-white"
                >
                  See pricing
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- Right-side detail overlay (custom) ---- */}
      {detailItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setDetailItem(null)}
          />
          {/* Panel */}
          <div
            className="fixed right-0 top-0 z-[61] h-full w-full border-l border-white/10 bg-black/95 text-white shadow-2xl sm:max-w-md"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between p-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/70">
                  Workout details
                </div>
                <div className="mt-1 text-lg font-semibold leading-tight">
                  {detailItem.title}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white hover:bg-white/10"
                aria-label="Close"
                onClick={() => setDetailItem(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Separator className="bg-white/10" />

            <div className="max-h-[calc(100vh-60px)] space-y-4 overflow-y-auto p-4 text-sm">
              <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <div className="text-white/70">Summary</div>
                <div className="mt-1 text-white">{detailItem.primary}</div>
              </div>

              {/* Coach's notes (with perceived effort for runs) */}
              {detailItem.kind === "run" && detailItem.zoneKey ? (
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-white/70">Coach’s notes</div>
                  {detailItem.detail && (
                    <div className="mt-1 text-white/90">
                      {detailItem.detail}
                    </div>
                  )}
                  <div className="mt-2 text-white/90">
                    {COACH_ACTIONS[detailItem.zoneKey]}
                  </div>
                  <div className="mt-3 text-white/90">
                    <span className="font-medium">
                      {detailItem.zoneKey} perceived effort:
                    </span>{" "}
                    {PERCEIVED_EFFORT[detailItem.zoneKey]}
                  </div>
                </div>
              ) : detailItem.detail ? (
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-white/70">Coach’s notes</div>
                  <div className="mt-1 text-white/90">{detailItem.detail}</div>
                </div>
              ) : null}

              {/* Training zone (if present) */}
              {detailItem.zoneKey &&
                zones &&
                (() => {
                  const z = detailItem.zoneKey;
                  const band = zones.bands[z];
                  const descriptor = `${z} / ${ZONE_DISPLAY[z]}`;
                  const paceText =
                    unitPref === "km"
                      ? `${secToMMSS(band.min_s_per_km)}–${secToMMSS(
                          band.max_s_per_km
                        )}${unitSuffix("km")}`
                      : `${secToMMSS(band.min_s_per_mi)}–${secToMMSS(
                          band.max_s_per_mi
                        )}${unitSuffix("mi")}`;
                  return (
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <div className="text-white/70">Training zone</div>
                      <div className="mt-2 font-medium text-white">
                        {descriptor}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-white/70">HR (of max)</div>
                          <div className="text-white">
                            {band.hr_pct_low}–{band.hr_pct_high}%
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70">Pace</div>
                          <div className="text-white">{paceText}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] leading-snug text-white/60">
                        {EFFORT_GUIDANCE}
                      </div>
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          className="rounded-xl text-white hover:bg-white/10"
                          onClick={() => setShowZoneGuide(true)}
                        >
                          Full zone guide
                        </Button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </>
      )}

      {/* Full zone guide modal */}
      {showZoneGuide && (
        <ZoneGuideModal onClose={() => setShowZoneGuide(false)} />
      )}
    </div>
  );
}
