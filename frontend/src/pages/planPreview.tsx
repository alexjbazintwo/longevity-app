// src/pages/planPreview.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Dumbbell,
  Flame,
  Info,
  Lock,
  Mountain,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils";

/** ---------- Types ---------- */

type DayKind =
  | "easy"
  | "tempo"
  | "intervals"
  | "long"
  | "rest"
  | "mobility"
  | "strength";

type PlanDay = {
  id: string; // unique ID for DnD
  dow: Weekday; // original day label (not enforced while dragging)
  title: string;
  kind: DayKind;
  primary: string;
  detail?: string;
  tags?: string[];
};

type WeekPlan = {
  index: number; // 1-based
  focus: string;
  volume: string;
  unlocked: boolean;
  days: PlanDay[];
};

type DemoPlan = {
  name: string;
  dist: string;
  goal?: string;
  weeks: WeekPlan[];
};

type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/** ---------- Constants ---------- */

const WEEK_DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** ---------- Demo Data (hardcoded preview) ---------- */

const DEMO_PLAN: DemoPlan = {
  name: "Runner",
  dist: "10K",
  goal: "≈ 45:00",
  weeks: [
    {
      index: 1,
      focus: "Aerobic base + light strides",
      volume: "~36 km",
      unlocked: true,
      days: [
        {
          id: "w1d1",
          dow: "Mon",
          title: "Easy Run",
          kind: "easy",
          primary: "40 min • Easy",
          detail: "Conversational pace, relaxed form",
          tags: ["Z2", "Low RPE"],
        },
        // Intentionally empty Tue
        {
          id: "w1d3",
          dow: "Wed",
          title: "Tempo",
          kind: "tempo",
          primary: "3 × 8 min • Tempo",
          detail: "2 min jog between reps",
          tags: ["T-pace", "Controlled"],
        },
        {
          id: "w1d4",
          dow: "Thu",
          title: "Easy Run",
          kind: "easy",
          primary: "45 min • Easy",
          detail: "Keep HR < 75% max",
          tags: ["Z2"],
        },
        // Intentionally empty Fri
        {
          id: "w1d6",
          dow: "Sat",
          title: "Long Run",
          kind: "long",
          primary: "90 min • Steady",
          detail: "Last 15 min moderate if feeling good",
          tags: ["Fuel", "Hydrate"],
        },
        {
          id: "w1d7",
          dow: "Sun",
          title: "Rest",
          kind: "rest",
          primary: "Rest / Walk 20–30 min",
          detail: "Light mobility optional",
          tags: ["Recover"],
        },
      ],
    },
    {
      index: 2,
      focus: "Threshold support + aerobic density",
      volume: "~38 km",
      unlocked: true,
      days: [
        {
          id: "w2d1",
          dow: "Mon",
          title: "Easy Run",
          kind: "easy",
          primary: "35–40 min • Easy",
          tags: ["Z2"],
        },
        {
          id: "w2d2",
          dow: "Tue",
          title: "Intervals",
          kind: "intervals",
          primary: "8 × 2 min • Fast",
          detail: "2 min easy between reps",
          tags: ["VO₂ stimulus", "Form"],
        },
        {
          id: "w2d3",
          dow: "Wed",
          title: "Mobility",
          kind: "mobility",
          primary: "10 min • Ankles & hips",
          tags: ["Recovery"],
        },
        {
          id: "w2d4",
          dow: "Thu",
          title: "Easy Run",
          kind: "easy",
          primary: "45 min • Easy",
          tags: ["Z2"],
        },
        {
          id: "w2d5",
          dow: "Fri",
          title: "Strength",
          kind: "strength",
          primary: "25–30 min • Full body",
          tags: ["Durability"],
        },
        {
          id: "w2d6",
          dow: "Sat",
          title: "Long Run",
          kind: "long",
          primary: "95 min • Steady",
          detail: "Add 6 × 20s strides mid-run",
          tags: ["Strides"],
        },
        {
          id: "w2d7",
          dow: "Sun",
          title: "Rest",
          kind: "rest",
          primary: "Rest / Optional 20–30 min walk",
          tags: ["Recover"],
        },
      ],
    },
    {
      index: 3,
      focus: "Progression + sharpening",
      volume: "~40 km",
      unlocked: false,
      days: [],
    },
    {
      index: 4,
      focus: "Deload + consolidation",
      volume: "~34 km",
      unlocked: false,
      days: [],
    },
  ],
};

/** ---------- Helpers ---------- */

function kindIcon(kind: DayKind) {
  switch (kind) {
    case "easy":
      return <Flame className="h-4 w-4" />;
    case "tempo":
      return <Timer className="h-4 w-4" />;
    case "intervals":
      return <Mountain className="h-4 w-4" />;
    case "long":
      return <CalendarDays className="h-4 w-4" />;
    case "strength":
      return <Dumbbell className="h-4 w-4" />;
    case "mobility":
      return <Check className="h-4 w-4" />;
    default:
      return <Lock className="h-4 w-4" />;
  }
}

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
}: {
  index: number;
  active: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-white/10 text-white ring-1 ring-white/15"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
      aria-pressed={active}
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

function DayCard({
  day,
  draggable,
  onDragStart,
}: {
  day: PlanDay;
  draggable: boolean;
  onDragStart: (id: string) => void;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-white/10 bg-white/5 ring-1 ring-white/10 backdrop-blur",
        draggable ? "cursor-grab active:cursor-grabbing" : "opacity-60"
      )}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        onDragStart(day.id);
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({ id: day.id })
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      aria-grabbed={draggable ? true : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-white/70">
              {day.dow}
            </div>
            <div className="mt-1 flex items-center gap-2 text-white">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10">
                {kindIcon(day.kind)}
              </span>
              <div className="truncate text-sm font-medium">{day.title}</div>
            </div>
          </div>
          <div
            className={cn(
              "shrink-0 rounded-md bg-indigo-500/10 px-2 py-1 text-xs text-white ring-1 ring-indigo-400/20",
              "max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap"
            )}
            title={day.primary}
          >
            {day.primary}
          </div>
        </div>
        {day.detail && (
          <div className="mt-2 text-sm text-white/80">{day.detail}</div>
        )}
        {day.tags && day.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {day.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/80 ring-1 ring-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
        "grid min-h-[92px] place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-3 text-center text-xs leading-5 text-white/70",
        isOver ? "ring-2 ring-emerald-300/60 bg-white/[0.06] text-white/80" : ""
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
          // ignore
        }
      }}
    >
      Drop a workout here
    </div>
  );
}

function WhyThisPlan({ onDismiss }: { onDismiss: () => void }) {
  return (
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
            You told us you’re targeting a <b>10K</b> with about{" "}
            <b>~40 minutes/week</b> available and a current fitness near{" "}
            <b>46–48 minutes</b>. We’ve emphasised <b>aerobic base</b> with a
            dose of <b>tempo</b> to lift threshold, plus <b>long-run</b> work to
            harden durability. We included <b>mobility</b> and light{" "}
            <b>strength</b> to reduce niggles so you can stack consistent weeks.
          </div>
          <div className="mt-2 text-[11px] text-white/70">
            Tip: Drag any workout to a different day. Drop targets highlight in
            green.
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-white/15 text-white"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
      </div>
    </motion.div>
  );
}

function LockOverlay({ onAction }: { onAction: () => void }) {
  return (
    <Card className="rounded-2xl border-white/10 bg-white/5 ring-1 ring-white/10 backdrop-blur">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <div className="font-medium">Weeks locked</div>
            <div className="text-sm text-white/80">
              Unlock all weeks to view and customise the full program.
            </div>
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
            className="rounded-xl border-white/15 text-white"
            onClick={onAction}
          >
            Compare plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** ---------- Page ---------- */

export default function PlanPreview() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [showWhy, setShowWhy] = useState<boolean>(true);
  const [hoverDay, setHoverDay] = useState<Weekday | null>(null);

  const baseWeek = useMemo<WeekPlan>(() => {
    const safe =
      DEMO_PLAN.weeks[
        Math.max(0, Math.min(DEMO_PLAN.weeks.length - 1, activeIdx))
      ];
    return safe;
  }, [activeIdx]);

  // Build a 7-day schedule (some days may be empty).
  const [scheduleByDay, setScheduleByDay] = useState<
    Record<Weekday, PlanDay[]>
  >(() => {
    const map: Record<Weekday, PlanDay[]> = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };
    for (const d of DEMO_PLAN.weeks[0].days) {
      map[d.dow].push(d);
    }
    return map;
  });

  // Rebuild schedule when switching weeks (for demo, copy from the selected unlocked week)
  const activeWeek = useMemo<WeekPlan>(() => baseWeek, [baseWeek]);

  const canDrag = activeWeek.unlocked;

  const initWeekSchedule = (week: WeekPlan): Record<Weekday, PlanDay[]> => {
    const map: Record<Weekday, PlanDay[]> = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };
    for (const d of week.days) {
      map[d.dow].push(d);
    }
    return map;
  };

  // Update schedule when week changes
  const handleWeekChange = (idx: number): void => {
    setActiveIdx(idx);
    const target = DEMO_PLAN.weeks[idx];
    if (target.unlocked) {
      setScheduleByDay(initWeekSchedule(target));
    } else {
      // locked weeks show empty schedule
      const empty: Record<Weekday, PlanDay[]> = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: [],
      };
      setScheduleByDay(empty);
    }
  };

  const moveItem = (id: string, toDay: Weekday): void => {
    // Find source day + item
    let foundDay: Weekday | null = null;
    let foundItem: PlanDay | null = null;
    for (const wd of WEEK_DAYS) {
      const arr = scheduleByDay[wd];
      const idx = arr.findIndex((x) => x.id === id);
      if (idx >= 0) {
        foundDay = wd;
        foundItem = arr[idx];
        break;
      }
    }
    if (!foundDay || !foundItem) return;
    if (foundDay === toDay) return; // no-op

    setScheduleByDay((prev) => {
      const next: Record<Weekday, PlanDay[]> = {
        Mon: [...prev.Mon],
        Tue: [...prev.Tue],
        Wed: [...prev.Wed],
        Thu: [...prev.Thu],
        Fri: [...prev.Fri],
        Sat: [...prev.Sat],
        Sun: [...prev.Sun],
      };
      // remove from source
      next[foundDay] = next[foundDay].filter((x) => x.id !== id);
      // add to target (update display dow to new day)
      next[toDay] = [...next[toDay], { ...foundItem, dow: toDay }];
      return next;
    });
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-64px)] bg-[#0b1026]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1026] via-[#0b1026] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_-6%,rgba(251,191,36,0.14),transparent_40%),radial-gradient(800px_420px_at_90%_-4%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(900px_520px_at_75%_90%,rgba(16,185,129,0.16),transparent_42%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/75">
              AI-tuned plan preview
            </div>
            <h1 className="mt-2 bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              {DEMO_PLAN.dist} • {DEMO_PLAN.name}
              {DEMO_PLAN.goal ? (
                <span className="ml-2 text-lg font-medium text-white/80">
                  — Goal {DEMO_PLAN.goal}
                </span>
              ) : null}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FocusBadge>Drag & drop days</FocusBadge>
            <FocusBadge>Adaptive</FocusBadge>
            <FocusBadge>Deload aware</FocusBadge>
          </div>
        </div>

        {/* Why this plan (dismissible) */}
        {showWhy && <WhyThisPlan onDismiss={() => setShowWhy(false)} />}

        {/* Week tabs */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {DEMO_PLAN.weeks.map((w) => (
            <WeekTab
              key={w.index}
              index={w.index}
              active={activeIdx === w.index - 1}
              locked={!w.unlocked}
              onClick={() => handleWeekChange(w.index - 1)}
            />
          ))}
        </div>

        {/* Week summary */}
        <Card className="mb-4 rounded-2xl border-white/10 bg-white/5 ring-1 ring-white/10 backdrop-blur">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div className="text-sm">
                <div className="font-medium">Week {activeWeek.index}</div>
                <div className="text-white/80">{activeWeek.focus}</div>
              </div>
            </div>
            <Separator className="bg-white/10 sm:hidden" />
            <div className="flex items-center gap-2 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
                <Flame className="h-4 w-4" />
              </span>
              <div className="text-sm">
                <div className="font-medium">Planned Volume</div>
                <div className="text-white/80">{activeWeek.volume}</div>
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
                className="rounded-xl border-white/15 text-white"
              >
                Export (locked)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 7-day grid with drag-and-drop (auto-fit with a safe min width) */}
        {activeWeek.unlocked ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {WEEK_DAYS.map((wd) => {
              const items = scheduleByDay[wd] ?? [];
              const isOver = hoverDay === wd;

              return (
                <div
                  key={wd}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-white/[0.04] p-3 ring-1 ring-white/10 backdrop-blur",
                    isOver ? "ring-2 ring-emerald-300/60 bg-white/[0.06]" : ""
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (canDrag) setHoverDay(wd);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (canDrag) setHoverDay(wd);
                  }}
                  onDragLeave={(e) => {
                    const rect = (
                      e.currentTarget as HTMLDivElement
                    ).getBoundingClientRect();
                    if (
                      e.clientX < rect.left ||
                      e.clientX > rect.right ||
                      e.clientY < rect.top ||
                      e.clientY > rect.bottom
                    ) {
                      setHoverDay((cur) => (cur === wd ? null : cur));
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!canDrag) return;
                    const raw = e.dataTransfer.getData("application/json");
                    try {
                      const parsed = JSON.parse(raw) as { id: string };
                      if (parsed && parsed.id) {
                        moveItem(parsed.id, wd);
                      }
                    } catch {
                      // ignore
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
                    {items.map((d) => (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DayCard
                          day={d}
                          draggable={canDrag}
                          onDragStart={() => {
                            /* noop */
                          }}
                        />
                      </motion.div>
                    ))}

                    {items.length === 0 && (
                      <EmptyDrop
                        isOver={isOver}
                        onDragOver={() => {
                          if (canDrag) setHoverDay(wd);
                        }}
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
        ) : (
          <div className="mt-2">
            <LockOverlay
              onAction={() => {
                /* open compare modal later */
              }}
            />
          </div>
        )}

        {/* Sales CTA */}
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
                className="rounded-xl border-white/15 text-white"
              >
                See pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
