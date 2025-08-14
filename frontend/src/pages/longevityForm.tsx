// src/pages/longevityForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// App data / types / hooks / context
import { questionSections } from "@/data/questions";
import type {
  Question,
  FormData as LongevityFormData,
} from "@/types/longevityForm";
import { useSubmitForm } from "@/hooks/useSubmitForm";
import { validateForm } from "@/hooks/useFormValidation";
import { useResultContext } from "@/context/resultContext";

// Ensure TS understands the section shape
type Section = { id: string; label: string; questions: Question[] };

/** Safely read an optional `placeholder` string without using `any`. */
function readPlaceholder(q: unknown, fallback = "Type here"): string {
  if (typeof q === "object" && q !== null && "placeholder" in q) {
    const v = (q as Record<string, unknown>).placeholder;
    return typeof v === "string" ? v : fallback;
  }
  return fallback;
}

/** Get label safely without `any`. */
function readLabel(q: Question): string {
  if (typeof q === "object" && q !== null && "label" in q) {
    const v = (q as Record<string, unknown>).label;
    return typeof v === "string" ? v : "";
  }
  return "";
}

/** Heuristic: mark key longevity predictors as required without touching your data file. */
function isQuestionRequired(q: Question): boolean {
  const nameStr = String(q.name);
  const labelStr = readLabel(q).toLowerCase();
  const lowerName = nameStr.toLowerCase();

  const needles = [
    "dob",
    "date of birth",
    "age",
    "gender",
    "sex",
    "height",
    "weight",
    "bmi",
    "smok", // smoking / smoker
    "alcohol",
    "drink",
    "exercise",
    "activity",
    "workout",
    "sleep",
    "hours of sleep",
  ];

  return needles.some((n) => lowerName.includes(n) || labelStr.includes(n));
}

/** Filled check for different input types. */
function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true; // numbers/booleans/objects considered filled
}

export default function LongevityFormPage() {
  const navigate = useNavigate();
  const { setResult } = useResultContext();
  const { submit } = useSubmitForm();

  const sections = questionSections as unknown as Section[];

  const [formData, setFormData] = useState<Partial<LongevityFormData>>(() => {
    try {
      const stored = localStorage.getItem("longevityFormData");
      return stored ? (JSON.parse(stored) as Partial<LongevityFormData>) : {};
    } catch {
      return {};
    }
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Typed helpers (avoid `any`)
  function setField<K extends keyof LongevityFormData>(
    key: K,
    value: LongevityFormData[K] | undefined
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy[String(key)]; // clear error as the user types/selects
      return copy;
    });
  }
  function getField<K extends keyof LongevityFormData>(
    key: K
  ): LongevityFormData[K] | undefined {
    return formData[key];
  }

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem("longevityFormData", JSON.stringify(formData));
  }, [formData]);

  const currentSection = sections[currentSectionIndex];
  const isLast = currentSectionIndex === sections.length - 1;
  const isFirst = currentSectionIndex === 0;

  // Per-section completion (for progress chips) — inline the answer check so deps are just [sections, formData]
  const sectionProgress = useMemo(() => {
    return sections.map((s) => {
      const total = s.questions.length;
      const answered = s.questions.filter((q) => {
        const key = q.name as keyof LongevityFormData;
        const v = (formData as Partial<LongevityFormData>)[key] as unknown;
        if (v === undefined || v === null) return false;
        if (typeof v === "string") return v.trim() !== "";
        if (Array.isArray(v)) return v.length > 0;
        return true;
      }).length;
      return {
        label: s.label,
        total,
        answered,
        pct: total ? Math.round((answered / total) * 100) : 0,
      };
    });
  }, [sections, formData]);

  function resetForm() {
    localStorage.removeItem("longevityFormData");
    setFormData({});
    setFormErrors({});
    setCurrentSectionIndex(0);
  }

  /** Validate the current section's *required* questions. */
  function validateCurrentSection(): boolean {
    const errs: Record<string, string> = {};
    for (const q of currentSection.questions) {
      if (!isQuestionRequired(q)) continue;
      const key = String(q.name);
      const fieldKey = q.name as keyof LongevityFormData;
      const value = (formData as Partial<LongevityFormData>)[fieldKey];
      if (!isFilled(value)) {
        errs[key] = "This field is required.";
      }
    }
    setFormErrors((prev) => ({ ...prev, ...errs }));

    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      const first = Object.keys(errs)[0];
      const el = document.getElementById(first);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  /** Validate *all sections* required questions before submit (plus your existing business rules). */
  function validateAllRequired(): Record<string, string> {
    const errs: Record<string, string> = {};
    for (const s of sections) {
      for (const q of s.questions) {
        if (!isQuestionRequired(q)) continue;
        const key = String(q.name);
        const fieldKey = q.name as keyof LongevityFormData;
        const value = (formData as Partial<LongevityFormData>)[fieldKey];
        if (!isFilled(value)) {
          errs[key] = "This field is required.";
        }
      }
    }
    return errs;
  }

  async function onSubmit() {
    try {
      setLoading(true);

      // Required-first validation across all sections
      const requiredErrors = validateAllRequired();
      // Your existing validator (kept as-is, merged in)
      const domainErrors = validateForm(formData as LongevityFormData) || {};
      const combined = { ...requiredErrors, ...domainErrors };

      setFormErrors(combined);
      if (Object.keys(combined).length > 0) {
        // Scroll to first error
        const first = Object.keys(combined)[0];
        const el = document.getElementById(first);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const apiResult = await submit(formData as LongevityFormData);
      const dob = (formData as LongevityFormData).dob;

      // Merge dob with API payload; infer types from submit and setResult
      type ApiResult = Awaited<ReturnType<typeof submit>>;
      type SetResultArg = Parameters<typeof setResult>[0];
      const payload = {
        dob,
        ...(apiResult as ApiResult),
      } as unknown as SetResultArg;

      setResult(payload);
      navigate("/life-expectancy-result");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/90 via-emerald-400/80 to-teal-500/90 shadow-sm shadow-emerald-500/20" />
            <div className="text-sm font-semibold tracking-tight">
              FIT to 100 • Assessment
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50"
              onClick={resetForm}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Reset form
            </Button>
          </div>
        </div>
      </header>

      {/* Hero title */}
      <section className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Your Longevity Assessment
              </motion.h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Answer a few evidence-based questions across four areas. You can
                pause anytime—your progress saves automatically.
              </p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <ShieldCheck className="h-4 w-4" /> Your data stays private
            </div>
          </div>

          {/* Section progress chips */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sectionProgress.map((p, i) => (
              <div
                key={p.label}
                className={`rounded-2xl border px-3 py-2 ${
                  i === currentSectionIndex
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{p.label}</span>
                  <span className="text-slate-500">{p.pct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form body */}
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {currentSection.label}
          </h2>
          <div className="text-xs text-slate-500">
            {sectionProgress[currentSectionIndex]?.answered} of{" "}
            {sectionProgress[currentSectionIndex]?.total} answered
          </div>
        </div>

        <div className="grid gap-4">
          {currentSection.questions.map((q: Question, idx: number) => {
            const key = String(q.name);
            const showRequired = isQuestionRequired(q);
            const hasError = Boolean(formErrors[key]);

            return (
              <Card
                key={`${key}-${idx}`}
                className={`rounded-2xl ${
                  hasError ? "border-red-300" : "border-slate-200"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={key}
                      className="block text-sm font-medium text-slate-800"
                    >
                      {readLabel(q) || key}
                    </label>
                    {showRequired && (
                      <span className="text-xs text-red-600">Required</span>
                    )}
                  </div>

                  <div className="mt-2">
                    {renderQuestion(q, getField, setField, hasError)}
                  </div>

                  {hasError && (
                    <div className="mt-2 text-sm text-red-600">
                      {formErrors[key]}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-8 grid grid-cols-2 items-center gap-3">
          <div>
            {!isFirst && (
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                onClick={() =>
                  setCurrentSectionIndex((i) => Math.max(0, i - 1))
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous section
              </Button>
            )}
          </div>

          <div className="flex justify-end">
            {!isLast ? (
              <Button
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-500 text-black hover:opacity-90"
                onClick={() => {
                  // Gate next on required questions in this section
                  if (validateCurrentSection()) {
                    setCurrentSectionIndex((i) =>
                      Math.min(sections.length - 1, i + 1)
                    );
                  }
                }}
              >
                Next section <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-500 text-black hover:opacity-90"
                onClick={onSubmit}
                disabled={loading}
              >
                {loading ? (
                  "Submitting…"
                ) : (
                  <span className="inline-flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Get my estimate
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Privacy reassurance */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4" /> We never sell your data. You
          control your information.
        </div>
      </main>
    </div>
  );
}

/** Renderer aligned with your Question['type'] union */
function renderQuestion(
  q: Question,
  getField: <K extends keyof LongevityFormData>(
    key: K
  ) => LongevityFormData[K] | undefined,
  setField: <K extends keyof LongevityFormData>(
    key: K,
    value: LongevityFormData[K] | undefined
  ) => void,
  hasError: boolean
) {
  const common =
    "w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2";
  const base = `${common} ${
    hasError
      ? "border-red-300 bg-red-50 focus:ring-red-200"
      : "border-slate-200 bg-white text-slate-900 focus:ring-emerald-200"
  }`;

  type Optioned = { options?: readonly (string | number)[] };

  switch (q.type) {
    case "date": {
      const key = q.name as keyof LongevityFormData;
      const value = (getField(key) as string | undefined) ?? "";
      return (
        <input
          id={String(q.name)}
          type="date"
          className={base}
          value={value}
          onChange={(e) =>
            setField(key, e.target.value as LongevityFormData[typeof key])
          }
        />
      );
    }

    case "number": {
      const key = q.name as keyof LongevityFormData;
      const value = getField(key) as number | undefined;
      const display: string | number = value ?? "";
      return (
        <input
          id={String(q.name)}
          type="number"
          className={base}
          value={display}
          onChange={(e) =>
            setField(
              key,
              (e.target.value === ""
                ? undefined
                : Number(e.target.value)) as LongevityFormData[typeof key]
            )
          }
        />
      );
    }

    case "text": {
      const key = q.name as keyof LongevityFormData;
      const value = (getField(key) as string | undefined) ?? "";
      const placeholder = readPlaceholder(q);
      return (
        <input
          id={String(q.name)}
          type="text"
          className={base}
          value={value}
          onChange={(e) =>
            setField(key, e.target.value as LongevityFormData[typeof key])
          }
          placeholder={placeholder}
        />
      );
    }

    case "select": {
      const key = q.name as keyof LongevityFormData;
      const opts = ((q as unknown as Optioned).options ?? []).map(String);
      const value = (getField(key) as string | undefined) ?? "";
      return (
        <select
          id={String(q.name)}
          className={base}
          value={value}
          onChange={(e) =>
            setField(key, e.target.value as LongevityFormData[typeof key])
          }
        >
          <option value="" disabled>
            Select an option
          </option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    case "multiSelect": {
      const key = q.name as keyof LongevityFormData;
      const current = (getField(key) as string[] | undefined) ?? [];
      const opts = ((q as unknown as Optioned).options ?? []).map(String);

      function toggle(val: string) {
        const set = new Set(current);
        if (set.has(val)) set.delete(val);
        else set.add(val);
        setField(
          key,
          Array.from(set) as unknown as LongevityFormData[typeof key]
        );
      }

      return (
        <div className="flex flex-wrap gap-2">
          {opts.map((opt) => {
            const active = current.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : hasError
                    ? "border-red-300 bg-red-50 text-slate-800"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    case "imageChoice": {
      // Treat as a stylized single-select
      const key = q.name as keyof LongevityFormData;
      const opts = ((q as unknown as Optioned).options ?? []).map(String);
      const value = (getField(key) as string | undefined) ?? "";
      return (
        <div className="flex flex-wrap gap-3">
          {opts.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setField(key, opt as LongevityFormData[typeof key])
                }
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : hasError
                    ? "border-red-300 bg-red-50 text-slate-800"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    default: {
      // If a new type is added to Question['type'], update renderer.
      return null;
    }
  }
}
