import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVertical } from "@/hooks/useVertical";
import type {
  IntakeField,
  IntakeSchema,
  DateField,
  TimeHMSField,
  NumberField,
  HoursPerWeekField,
  SingleChoiceField,
  MultiSelectField,
  TextField,
  IntakeSection,
} from "@/types/intake";

type Answers = Record<string, string | number | string[]>;
type Motive = "race" | "distance" | "health" | "comeback" | "habit";

const MOTIVES: { key: Motive; label: string; hint?: string }[] = [
  { key: "race", label: "Race", hint: "Specific event" },
  { key: "distance", label: "Distance", hint: "Build to a target distance" },
  { key: "health", label: "Health", hint: "Energy, cardio, metabolic" },
  { key: "comeback", label: "Comeback", hint: "After time off or niggle" },
  { key: "habit", label: "Habit", hint: "Consistency" },
];

function isFilled(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  return true;
}

function useLocalAnswers(key = "setupAnswers") {
  const [answers, setAnswers] = useState<Answers>({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setAnswers(JSON.parse(saved) as Answers);
    } catch {
      setAnswers({});
    }
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [key, answers]);
  return { answers, setAnswers };
}

function Pill({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] ring-1",
        active
          ? "bg-indigo-500/30 text-white ring-indigo-400/60"
          : "bg-white/5 text-white/75 ring-white/10",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function parseHMS(s: string): { h: string; m: string; sec: string } {
  const parts = s.split(":");
  if (parts.length === 3)
    return { h: parts[0] ?? "", m: parts[1] ?? "", sec: parts[2] ?? "" };
  if (parts.length === 2)
    return { h: "0", m: parts[0] ?? "", sec: parts[1] ?? "" };
  return { h: "", m: "", sec: "" };
}

function toHMS(h: string, m: string, sec: string): string {
  const hh = String(Math.max(0, Number(h) || 0));
  const mm = String(Math.max(0, Math.min(59, Number(m) || 0))).padStart(2, "0");
  const ss = String(Math.max(0, Math.min(59, Number(sec) || 0))).padStart(
    2,
    "0"
  );
  return `${hh}:${mm}:${ss}`;
}

/* ---------- Field Renderers (crisp selection, no blur) ---------- */

function ChoiceTiles({
  field,
  value,
  onChange,
}: {
  field: SingleChoiceField;
  value: string | number | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {field.options.map((opt) => {
        const active = value === opt.key;
        return (
          <label
            key={opt.key}
            className={[
              "relative cursor-pointer rounded-2xl px-4 py-4 transition",
              "ring-1 ring-white/20 bg-white/10 hover:bg-white/15",
              active
                ? "ring-indigo-300/60 shadow-[0_0_0_2px_rgba(99,102,241,0.35)]"
                : "",
              "focus-within:ring-2 focus-within:ring-indigo-300/60",
            ].join(" ")}
          >
            <input
              type="radio"
              name={field.id}
              value={opt.key}
              className="sr-only"
              checked={active}
              onChange={() => onChange(opt.key)}
            />
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">
                {opt.label}
              </div>
              <span
                aria-hidden
                className={[
                  "h-1.5 w-10 rounded-full transition",
                  active ? "bg-emerald-300" : "bg-white/25",
                ].join(" ")}
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}

function MultiSelectChips({
  field,
  value,
  onChange,
}: {
  field: MultiSelectField;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
}) {
  const set = new Set(value ?? []);
  function toggle(k: string) {
    const next = new Set(set);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    onChange(Array.from(next));
  }
  return (
    <div className="flex flex-wrap gap-2">
      {field.options.map((opt) => {
        const active = set.has(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={[
              "rounded-xl border px-3 py-2 text-sm transition",
              active
                ? "border-emerald-300 bg-emerald-50/10 text-emerald-200"
                : "border-white/20 bg-white/10 text-white hover:bg-white/15",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function HoursSlider({
  field,
  value,
  onChange,
}: {
  field: HoursPerWeekField;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const v =
    typeof value === "number" && !Number.isNaN(value) ? value : field.min;
  const pct = ((v - field.min) / (field.max - field.min)) * 100;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>{field.min} h</span>
        <span>{field.max} h</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"
          style={{ width: `${pct}%` }}
        />
        <input
          aria-label={field.label}
          type="range"
          min={field.min}
          max={field.max}
          step={1}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-2 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="text-sm text-white">{v} hours per week</div>
    </div>
  );
}

function NumberInput({
  field,
  value,
  onChange,
}: {
  field: NumberField;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const display =
    value === undefined || Number.isNaN(value) ? "" : String(value);
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.trim();
    if (raw === "") {
      onChange(Number.NaN);
      return;
    }
    const n = Number(raw);
    if (!Number.isNaN(n)) onChange(n);
  }
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      min={field.min}
      max={field.max}
      aria-label={field.label}
      value={display}
      onChange={handleChange}
      className="w-full appearance-none rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
      placeholder={field.placeholder ?? ""}
    />
  );
}

function TextInput({
  field,
  value,
  onChange,
}: {
  field: TextField;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder={field.placeholder ?? ""}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
    />
  );
}

function DateInput({
  value,
  onChange,
  minISO,
}: {
  field: DateField;
  value: string | undefined;
  onChange: (v: string) => void;
  minISO?: string;
}) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      min={minISO}
      className="w-full rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white outline-none focus:border-indigo-400/40"
    />
  );
}

function TimeHMSInput({
  field,
  value,
  onChange,
}: {
  field: TimeHMSField;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const { h, m, sec } = parseHMS(value ?? "");
  function onH(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(toHMS(e.target.value, m, sec));
  }
  function onM(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(toHMS(h, e.target.value, sec));
  }
  function onS(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(toHMS(h, m, e.target.value));
  }
  const box =
    "w-full rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40";
  return (
    <div className="grid grid-cols-3 gap-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="HH"
        value={h}
        onChange={onH}
        className={box}
        aria-label={`${field.label} hours`}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="MM"
        value={m}
        onChange={onM}
        className={box}
        aria-label={`${field.label} minutes`}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="SS"
        value={sec}
        onChange={onS}
        className={box}
        aria-label={`${field.label} seconds`}
      />
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
  minISO,
}: {
  field: IntakeField;
  value: string | number | string[] | undefined;
  onChange: (v: string | number | string[]) => void;
  minISO?: string;
}) {
  switch (field.type) {
    case "singleChoice":
      return (
        <ChoiceTiles
          field={field}
          value={value as string | number | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "multiSelect":
      return (
        <MultiSelectChips
          field={field}
          value={value as string[] | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "hoursPerWeek":
      return (
        <HoursSlider
          field={field}
          value={value as number | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "number":
      return (
        <NumberInput
          field={field}
          value={value as number | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "text":
      return (
        <TextInput
          field={field}
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "date":
      return (
        <DateInput
          field={field}
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
          minISO={minISO}
        />
      );
    case "timeHMS":
      return (
        <TimeHMSInput
          field={field}
          value={value as string | undefined}
          onChange={(v) => onChange(v)}
        />
      );
    default:
      return null;
  }
}

/* ---------- Stage builder ---------- */

type Stage =
  | { kind: "motives" }
  | { kind: "priority" }
  | { kind: "section"; section: IntakeSection };

export default function PlanSetup() {
  const navigate = useNavigate();
  const { pack } = useVertical();
  const schema: IntakeSchema = pack.intakeSchema;

  const { answers, setAnswers } = useLocalAnswers();

  const [motives, setMotives] = useState<Motive[]>(
    Array.isArray(answers.motives) ? (answers.motives as Motive[]) : []
  );
  const [priority, setPriority] = useState<Motive | "">(
    (answers.priority as Motive) || ""
  );
  const [step, setStep] = useState(0);
  const [showSecondEvent, setShowSecondEvent] = useState<boolean>(
    Boolean(answers["race2Distance"] || answers["race2Date"])
  );

  const sById = useMemo(() => {
    const map = new Map<string, IntakeSection>();
    schema.forEach((s) => s.fields.forEach((f) => map.set(f.id, s)));
    return map;
  }, [schema]);

  const raceSection = sById.get("raceDistance");
  const distanceSection = sById.get("distanceGoal");
  const healthSection = sById.get("healthFocus");
  const comebackSection = sById.get("physioCleared");
  const styleSection = sById.get("coachingStyle");
  const timeLoadSection = sById.get("hours") ?? sById.get("currentMileage");
  const prefsSection = sById.get("surface");

  const stages = useMemo<Stage[]>(() => {
    const out: Stage[] = [{ kind: "motives" }];
    if (motives.length > 1) out.push({ kind: "priority" });

    const map: Record<Motive, IntakeSection | undefined> = {
      race: raceSection,
      distance: distanceSection,
      health: healthSection,
      comeback: comebackSection,
      habit: styleSection,
    };

    const orderedMotives: Motive[] =
      priority && motives.includes(priority)
        ? [priority, ...motives.filter((m) => m !== priority)]
        : motives.slice();

    for (const m of orderedMotives) {
      const sec = map[m];
      if (sec) out.push({ kind: "section", section: sec });
    }

    if (timeLoadSection)
      out.push({ kind: "section", section: timeLoadSection });
    if (prefsSection) out.push({ kind: "section", section: prefsSection });
    if (styleSection && !orderedMotives.includes("habit")) {
      out.push({ kind: "section", section: styleSection });
    }

    return out;
  }, [
    motives,
    priority,
    raceSection,
    distanceSection,
    healthSection,
    comebackSection,
    timeLoadSection,
    prefsSection,
    styleSection,
  ]);

  useEffect(() => {
    setStep((s) => (s >= stages.length ? Math.max(0, stages.length - 1) : s));
  }, [stages.length]);

  useEffect(() => {
    setAnswers((a) => ({ ...a, motives, priority }));
  }, [motives, priority, setAnswers]);

  const firstDetailsIndex = useMemo(
    () => stages.findIndex((st) => st.kind === "section"),
    [stages]
  );
  const total = stages.length;
  const progressPct = total > 0 ? Math.round(((step + 1) / total) * 100) : 0;

  const canNext = useMemo(() => {
    const st = stages[step];
    if (!st) return false;

    if (st.kind === "motives") return motives.length > 0;
    if (st.kind === "priority") return priority !== "";

    if (st.kind === "section") {
      for (const f of st.section.fields) {
        if (f.required && !isFilled(answers[f.id])) return false;
      }
      if (st.section === raceSection && showSecondEvent) {
        const mustHave = [
          "race2Distance",
          "race2Date",
          "currentFitnessTime2",
        ] as const;
        for (const k of mustHave) {
          const v = answers[k as string];
          if (!isFilled(v)) return false;
        }
      }
      return true;
    }
    return false;
  }, [
    stages,
    step,
    motives.length,
    priority,
    answers,
    raceSection,
    showSecondEvent,
  ]);

  const goNext = useCallback(() => {
    if (step < total - 1) setStep((s) => s + 1);
    else navigate("/plan-preview");
  }, [step, total, navigate]);

  const goBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const current = stages[step];
  const units = useMemo(() => (answers["units"] as string) || "km", [answers]);

  function todayISO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function weeksUntil(dateISO: string): number | null {
    if (!dateISO) return null;
    const now = new Date();
    const race = new Date(dateISO);
    const ms = race.getTime() - now.getTime();
    const weeks = ms / (1000 * 60 * 60 * 24 * 7);
    return Number.isFinite(weeks) ? Math.max(0, Math.round(weeks)) : null;
  }

  function event2FieldsFromRace(race: IntakeSection): IntakeField[] {
    const suffix = "2";
    return race.fields
      .filter((f) =>
        [
          "raceDistance",
          "raceDate",
          "currentFitnessTime",
          "targetTime",
          "courseProfile",
        ].includes(f.id)
      )
      .map((f) => {
        const clone: IntakeField = {
          ...f,
          id: `${f.id}${suffix}`,
        } as IntakeField;
        if (clone.id === `currentFitnessTime${suffix}`) {
          (clone as TimeHMSField).label =
            "If you raced this distance today, what time would you run? (estimate if unsure)";
          (clone as TimeHMSField).required = true;
        }
        if (clone.id === `targetTime${suffix}`) {
          (clone as TimeHMSField).label = "Target finish time";
          (clone as TimeHMSField).required = false;
        }
        if (clone.id === `raceDate${suffix}`) {
          (clone as DateField).label = "Race date";
          (clone as DateField).required = true;
        }
        if (clone.id === `raceDistance${suffix}`) {
          (clone as SingleChoiceField).label = "Event distance";
          (clone as SingleChoiceField).required = true;
        }
        if (clone.id === `courseProfile${suffix}`) {
          (clone as SingleChoiceField).label = "Course profile";
          (clone as SingleChoiceField).required = false;
        }
        return clone;
      });
  }

  const onToggleSecondEvent = useCallback(() => {
    setShowSecondEvent((v) => !v);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a1024] via-[#0a1024] to-black" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-8%,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.14),transparent_38%)]" />

      <header className="sticky top-[64px] z-10 border-b border-indigo-300/15 bg-[#0b1026]/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Pill active={step >= 0}>Motives</Pill>
              {stages.some((s) => s.kind === "priority") && (
                <Pill active={step >= 1}>Priority</Pill>
              )}
              <Pill
                active={firstDetailsIndex !== -1 && step >= firstDetailsIndex}
              >
                Details
              </Pill>
              <Pill active={step >= total - 1}>Finish</Pill>
            </div>
            <div className="w-48">
              <div className="h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-8">
        <Card className="overflow-hidden rounded-3xl border-indigo-300/15 bg-white/5 ring-1 ring-indigo-400/10 backdrop-blur">
          <CardContent className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {current?.kind === "motives" && (
                  <div>
                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                      What brings you to Runzi?
                    </h1>
                    <p className="mt-2 text-white/80">
                      Pick everything that applies. We’ll tailor the next steps.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {MOTIVES.map((m) => {
                        const active = motives.includes(m.key);
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() =>
                              setMotives((prev) =>
                                prev.includes(m.key)
                                  ? prev.filter((x) => x !== m.key)
                                  : [...prev, m.key]
                              )
                            }
                            className={[
                              "relative rounded-2xl px-4 py-4 text-left transition",
                              "ring-1 ring-white/20 bg-white/10 hover:bg-white/15",
                              active
                                ? "ring-indigo-300/60 shadow-[0_0_0_2px_rgba(99,102,241,0.35)]"
                                : "",
                              "focus:outline-none focus:ring-2 focus:ring-indigo-300/60",
                            ].join(" ")}
                          >
                            <div className="relative z-10">
                              <div className="text-sm font-semibold text-white">
                                {m.label}
                              </div>
                              {m.hint && (
                                <div className="mt-1 text-[11px] text-white/70">
                                  {m.hint}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {current?.kind === "priority" && (
                  <div>
                    <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                      What’s your top priority?
                    </h2>
                    <p className="mt-2 text-white/80">
                      We’ll still consider your other choices.
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {motives.map((m) => {
                        const meta = MOTIVES.find((x) => x.key === m)!;
                        const active = priority === m;
                        return (
                          <label
                            key={m}
                            className={[
                              "relative cursor-pointer rounded-2xl px-4 py-4 transition",
                              "ring-1 ring-white/20 bg-white/10 hover:bg-white/15",
                              active
                                ? "ring-indigo-300/60 shadow-[0_0_0_2px_rgba(99,102,241,0.35)]"
                                : "",
                              "focus-within:ring-2 focus-within:ring-indigo-300/60",
                            ].join(" ")}
                          >
                            <input
                              type="radio"
                              name="priority"
                              className="sr-only"
                              checked={active}
                              onChange={() => setPriority(m)}
                            />
                            <div className="relative z-10">
                              <div className="text-sm font-semibold text-white">
                                {meta.label}
                              </div>
                              {meta.hint && (
                                <div className="mt-1 text-[11px] text-white/70">
                                  {meta.hint}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {current?.kind === "section" && (
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {current.section.title}
                    </h2>
                    <p className="mt-1 text-white/80">
                      {current.section.subtitle}
                    </p>
                    <div className="mt-6 grid gap-5">
                      {current.section.fields.map((f) => {
                        const id = f.id;
                        const required = Boolean(f.required);
                        const val = answers[id];

                        const labelSuffix =
                          id === "currentMileage" ||
                          id === "longestRun" ||
                          id === "currentLongest"
                            ? ` (${units})`
                            : id === "comfortablePace"
                            ? ` (per ${units === "mi" ? "mile" : "km"})`
                            : "";

                        return (
                          <div key={id} className="space-y-2">
                            <div className="flex items-baseline justify-between">
                              <label className="text-sm font-medium text-white">
                                {f.label}
                                {labelSuffix}
                                {required ? " *" : " (optional)"}
                              </label>
                              {"placeholder" in f && f.placeholder ? (
                                <span className="text-[11px] text-white/60">
                                  {f.placeholder}
                                </span>
                              ) : null}
                            </div>
                            <Field
                              field={f}
                              value={val}
                              onChange={(v) =>
                                setAnswers((a) => ({ ...a, [id]: v }))
                              }
                              minISO={
                                f.type === "date" ? todayISO() : undefined
                              }
                            />
                            {id === "raceDate" &&
                              typeof val === "string" &&
                              val && (
                                <div className="text-[11px] text-white/70">
                                  {(() => {
                                    const w = weeksUntil(val);
                                    return w !== null ? `${w} weeks to go` : "";
                                  })()}
                                </div>
                              )}
                          </div>
                        );
                      })}

                      {current.section === raceSection && (
                        <div className="mt-2">
                          {!showSecondEvent ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                              onClick={onToggleSecondEvent}
                            >
                              Add another event
                            </Button>
                          ) : (
                            <div className="space-y-5">
                              <div className="mt-6 text-sm font-semibold text-white">
                                Event 2
                              </div>
                              {event2FieldsFromRace(raceSection!).map((f2) => {
                                const id2 = f2.id;
                                const required2 = Boolean(f2.required);
                                const val2 = answers[id2];

                                return (
                                  <div key={id2} className="space-y-2">
                                    <div className="flex items-baseline justify-between">
                                      <label className="text-sm font-medium text-white">
                                        {f2.label}
                                        {required2 ? " *" : " (optional)"}
                                      </label>
                                      {"placeholder" in f2 && f2.placeholder ? (
                                        <span className="text-[11px] text-white/60">
                                          {f2.placeholder}
                                        </span>
                                      ) : null}
                                    </div>
                                    <Field
                                      field={f2}
                                      value={val2}
                                      onChange={(v) =>
                                        setAnswers((a) => ({ ...a, [id2]: v }))
                                      }
                                      minISO={
                                        f2.type === "date"
                                          ? todayISO()
                                          : undefined
                                      }
                                    />
                                    {id2 === "raceDate2" &&
                                      typeof val2 === "string" &&
                                      val2 && (
                                        <div className="text-[11px] text-white/70">
                                          {(() => {
                                            const w = weeksUntil(val2);
                                            return w !== null
                                              ? `${w} weeks to go`
                                              : "";
                                          })()}
                                        </div>
                                      )}
                                  </div>
                                );
                              })}

                              <div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                                  onClick={onToggleSecondEvent}
                                >
                                  Remove event 2
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between">
              <Button
                variant="outline"
                className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={goBack}
                disabled={step === 0}
              >
                Back
              </Button>
              <Button
                className={[
                  "rounded-xl text-black",
                  "bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300",
                  !canNext ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
                onClick={goNext}
                disabled={!canNext}
              >
                {step < stages.length - 1 ? "Next" : "See my AI-tuned week"}
              </Button>
            </div>

            <div className="mt-6 text-center text-[12px] text-white/70">
              Plans adapt weekly — change these anytime.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
