// src/pages/planSetup.tsx
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVertical } from "@/hooks/useVertical";
import type { IntakeField, IntakeSchema } from "@/types/intake";

type Answers = Record<string, string | number | string[]>;
type Motive = "race" | "distance" | "health" | "comeback" | "habit";

const MOTIVES: { key: Motive; label: string; hint?: string }[] = [
  { key: "race", label: "Race", hint: "Specific event" },
  { key: "distance", label: "Distance", hint: "Not a race" },
  { key: "health", label: "Health", hint: "Capacity, energy, resilience" },
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
    } catch (err) {
      void err;
      setAnswers({});
    }
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(answers));
    } catch (err) {
      void err;
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

/* ---------- Field Renderers ---------- */

function ChoiceTiles({
  field,
  value,
  onChange,
}: {
  field: Extract<IntakeField, { type: "singleChoice" }>;
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
              active ? "ring-emerald-300/60 bg-white/15" : "",
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
            <span
              aria-hidden
              className={[
                "pointer-events-none absolute -inset-[2px] rounded-[1.25rem] opacity-0 blur transition-opacity duration-300",
                active ? "opacity-100" : "focus-within:opacity-100",
              ].join(" ")}
              style={{
                background:
                  "linear-gradient(90deg, rgba(251,191,36,0.45), rgba(56,189,248,0.45), rgba(16,185,129,0.45))",
              }}
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
  field: Extract<IntakeField, { type: "multiSelect" }>;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
}) {
  const selected = new Set(value ?? []);
  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  }
  return (
    <div className="flex flex-wrap gap-2">
      {field.options.map((opt) => {
        const active = selected.has(opt.key);
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
  field: Extract<IntakeField, { type: "hoursPerWeek" }>;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const v =
    typeof value === "number" && !Number.isNaN(value) ? value : field.min;
  const pct = ((v - field.min) / (field.max - field.min)) * 100;
  function onInput(e: ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }
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
          onChange={onInput}
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
  field: Extract<IntakeField, { type: "number" }>;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  function onChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    onChange(raw === "" ? Number.NaN : Number(raw));
  }
  return (
    <input
      type="number"
      min={field.min}
      max={field.max}
      step={field.step ?? 1}
      value={value ?? ""}
      onChange={onChangeInput}
      className="w-full rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
      placeholder={field.placeholder ?? ""}
    />
  );
}

function TextInput({
  field,
  value,
  onChange,
}: {
  field: Extract<IntakeField, { type: "text" }>;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  function onChangeInput(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }
  return (
    <input
      type="text"
      placeholder={field.placeholder ?? ""}
      value={value ?? ""}
      onChange={onChangeInput}
      className="w-full rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
    />
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: IntakeField;
  value: string | number | string[] | undefined;
  onChange: (v: string | number | string[]) => void;
}) {
  if (field.type === "singleChoice") {
    return (
      <ChoiceTiles
        field={field}
        value={value as string | number | undefined}
        onChange={(v) => onChange(v)}
      />
    );
  }
  if (field.type === "multiSelect") {
    return (
      <MultiSelectChips
        field={field}
        value={value as string[] | undefined}
        onChange={(v) => onChange(v)}
      />
    );
  }
  if (field.type === "hoursPerWeek") {
    return (
      <HoursSlider
        field={field}
        value={value as number | undefined}
        onChange={(v) => onChange(v)}
      />
    );
  }
  if (field.type === "number") {
    return (
      <NumberInput
        field={field}
        value={value as number | undefined}
        onChange={(v) => onChange(v)}
      />
    );
  }
  return (
    <TextInput
      field={field as Extract<IntakeField, { type: "text" }>}
      value={value as string | undefined}
      onChange={(v) => onChange(v)}
    />
  );
}

/* ---------- Page ---------- */

export default function PlanSetup() {
  const navigate = useNavigate();
  const { pack } = useVertical();
  const schema: IntakeSchema = pack.intakeSchema;

  const { answers, setAnswers } = useLocalAnswers();

  const [motives, setMotives] = useState<Motive[]>(
    Array.isArray(answers.motives) ? (answers.motives as Motive[]) : []
  );
  const [priority, setPriority] = useState<Motive | "">(
    ((answers.priority as Motive) ?? "") as Motive | ""
  );

  const raceSection = useMemo(
    () => schema.find((s) => s.fields.some((f) => f.id === "raceDistance")),
    [schema]
  );
  const distanceSection = useMemo(
    () => schema.find((s) => s.fields.some((f) => f.id === "distanceGoal")),
    [schema]
  );
  const healthSection = useMemo(
    () => schema.find((s) => s.fields.some((f) => f.id === "healthFocus")),
    [schema]
  );
  const comebackSection = useMemo(
    () => schema.find((s) => s.fields.some((f) => f.id === "physioCleared")),
    [schema]
  );
  const timeLoadSection = useMemo(
    () =>
      schema.find((s) =>
        s.fields.some((f) => f.id === "hours" || f.id === "currentMileage")
      ),
    [schema]
  );
  const prefsSection = useMemo(
    () => schema.find((s) => s.fields.some((f) => f.id === "surface")),
    [schema]
  );
  const styleSection = useMemo(
    () => schema.find((s) => s.fields.some((f) => f.id === "coachingStyle")),
    [schema]
  );

  const followUps = useMemo(() => {
    const mset = new Set(motives);
    const map: Record<
      Motive,
      | typeof raceSection
      | typeof distanceSection
      | typeof healthSection
      | typeof comebackSection
      | typeof styleSection
      | undefined
    > = {
      race: raceSection,
      distance: distanceSection,
      health: healthSection,
      comeback: comebackSection,
      habit: styleSection,
    };

    const ordered: (typeof raceSection)[] = [];
    if (priority && mset.has(priority)) {
      const sec = map[priority];
      if (sec) ordered.push(sec);
    }
    for (const m of motives) {
      if (m === priority) continue;
      const sec = map[m];
      if (sec && !ordered.includes(sec)) ordered.push(sec);
    }
    if (timeLoadSection) ordered.push(timeLoadSection);
    if (prefsSection) ordered.push(prefsSection);
    return ordered.filter(Boolean) as NonNullable<typeof raceSection>[];
  }, [
    motives,
    priority,
    raceSection,
    distanceSection,
    healthSection,
    comebackSection,
    styleSection,
    timeLoadSection,
    prefsSection,
  ]);

  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 1 && motives.length === 1) {
      const only = motives[0];
      if (priority !== only) setPriority(only);
      setStep(2);
    }
  }, [step, motives, priority]);

  const stepsBeforeFollowups = motives.length > 1 ? 2 : 1;
  const total = stepsBeforeFollowups + followUps.length;
  const progressPct = Math.round(((step + 1) / Math.max(total, 1)) * 100);

  const canNext = useMemo(() => {
    if (step === 0) return motives.length > 0;
    if (motives.length > 1 && step === 1) return priority !== "";
    const sec = followUps[step - stepsBeforeFollowups];
    if (!sec) return true;
    for (const f of sec.fields) {
      const required = Boolean(f.required);
      if (required && !isFilled(answers[f.id])) return false;
    }
    return true;
  }, [
    step,
    motives.length,
    priority,
    followUps,
    stepsBeforeFollowups,
    answers,
  ]);

  const goNext = useCallback(() => {
    if (step < total - 1) setStep((s) => s + 1);
    else navigate("/plan-preview");
  }, [step, total, navigate]);

  const goBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  useEffect(() => {
    setAnswers((a) => ({ ...a, motives, priority }));
  }, [motives, priority, setAnswers]);

  const currentSec =
    step < stepsBeforeFollowups ? null : followUps[step - stepsBeforeFollowups];
  const units = (answers["units"] as string) || "km";

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a1024] via-[#0a1024] to-black" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-8%,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.14),transparent_38%)]" />

      <header className="sticky top-[64px] z-10 border-b border-indigo-300/15 bg-[#0b1026]/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Pill active={step >= 0}>Motives</Pill>
              {motives.length > 1 && <Pill active={step >= 1}>Priority</Pill>}
              <Pill active={step >= stepsBeforeFollowups}>Details</Pill>
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
                {step === 0 && (
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
                              active ? "ring-emerald-300/60 bg-white/15" : "",
                              "focus:outline-none focus:ring-2 focus:ring-indigo-300/60",
                            ].join(" ")}
                          >
                            <span
                              aria-hidden
                              className={[
                                "pointer-events-none absolute -inset-[2px] rounded-[1.25rem] opacity-0 blur transition-opacity duration-300",
                                active ? "opacity-100" : "",
                              ].join(" ")}
                              style={{
                                background:
                                  "linear-gradient(90deg, rgba(251,191,36,0.45), rgba(56,189,248,0.45), rgba(16,185,129,0.45))",
                              }}
                            />
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

                {motives.length > 1 && step === 1 && (
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
                              active ? "ring-emerald-300/60 bg-white/15" : "",
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
                            <span
                              aria-hidden
                              className={[
                                "pointer-events-none absolute -inset-[2px] rounded-[1.25rem] opacity-0 blur transition-opacity duration-300",
                                active ? "opacity-100" : "",
                              ].join(" ")}
                              style={{
                                background:
                                  "linear-gradient(90deg, rgba(251,191,36,0.45), rgba(56,189,248,0.45), rgba(16,185,129,0.45))",
                              }}
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

                {step >= (motives.length > 1 ? 2 : 1) &&
                  step < total &&
                  currentSec && (
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {currentSec.title}
                      </h2>
                      <p className="mt-1 text-white/80">
                        {currentSec.subtitle}
                      </p>
                      <div className="mt-6 grid gap-5">
                        {currentSec.fields.map((f) => {
                          const id = f.id;
                          const required = Boolean(f.required);
                          const val = answers[id];
                          const isMileage = id === "currentMileage";
                          return (
                            <div key={id} className="space-y-2">
                              <div className="flex items-baseline justify-between">
                                <label className="text-sm font-medium text-white">
                                  {f.label}
                                  {isMileage ? ` (${units})` : ""}
                                  {required ? " *" : ""}
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
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between">
              <Button
                variant="outline"
                className="rounded-xl border-white/20 bg白/5 text-white hover:bg-white/10"
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
                {step < total - 1 ? "Next" : "See my AI-tuned week"}
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
