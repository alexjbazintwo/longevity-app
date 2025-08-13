import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { questionSections } from "../data/questions";
import type { Question, FormData } from "../types/longevityForm";
import { useSubmitForm } from "../hooks/useSubmitForm";
import { validateForm } from "../hooks/useFormValidation";
import { useResultContext } from "../context/resultContext";

type FieldValue = string | number | string[] | undefined;

export default function LongevityForm() {
  // Load & sanitize persisted data
  const [formData, setFormData] = useState<Partial<FormData>>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("longevityFormData") || "{}"
      );
      const cleaned: Partial<FormData> = {};
      questionSections
        .flatMap((s) => s.questions)
        .forEach((q) => {
          const v = saved[q.name];
          const keep =
            v !== undefined &&
            v !== null &&
            !(typeof v === "string" && v.trim() === "") &&
            !(Array.isArray(v) && v.length === 0);
          if (keep) cleaned[q.name] = v;
        });
      return cleaned;
    } catch {
      return {};
    }
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [nextFieldToScrollTo, setNextFieldToScrollTo] = useState<string | null>(
    null
  );

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  const { submit } = useSubmitForm();
  const { setResult } = useResultContext();
  const navigate = useNavigate();

  const currentSection = useMemo(
    () => questionSections[currentSectionIndex],
    [currentSectionIndex]
  );
  const isLastSection = currentSectionIndex === questionSections.length - 1;

  const brightColors = [
    "rgb(37 99 235)", // blue-600
    "rgb(22 163 74)", // green-600
    "rgb(124 58 237)", // purple-600
    "rgb(249 115 22)", // orange-500
  ];
  const hoverBgColors = brightColors.map(
    (rgb) => `rgba(${rgb.match(/\d+/g)?.join(", ")}, 0.15)`
  );

  const fieldLabel =
    "block font-light text-3xl leading-[35px] text-[#515151] mb-4";

  const scrollIntoViewSafely = (el?: HTMLElement | null) => {
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      );
    });
  };

  const scrollToNextOrButtons = (currentName: string) => {
    const idx = currentSection.questions.findIndex(
      (q) => q.name === currentName
    );
    const next = currentSection.questions[idx + 1];
    if (next) setNextFieldToScrollTo(next.name);
    else scrollIntoViewSafely(buttonsRef.current);
  };

  useEffect(() => {
    localStorage.setItem("longevityFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const first = currentSection.questions[0]?.name;
    scrollIntoViewSafely(fieldRefs.current[first]);
  }, [currentSectionIndex, currentSection.questions]);

  useEffect(() => {
    if (!nextFieldToScrollTo) return;
    scrollIntoViewSafely(fieldRefs.current[nextFieldToScrollTo]);
    setNextFieldToScrollTo(null);
  }, [formData, nextFieldToScrollTo]);

  const isAnswered = (q: Question, data: Partial<FormData>) => {
    const v = data[q.name];

    switch (q.type) {
      case "multiSelect":
        return Array.isArray(v) && v.length > 0;

      case "number": {
        if (v === undefined || v === null) return false;
        if (typeof v === "number") return Number.isFinite(v);
        if (typeof v === "string") {
          const trimmed = v.trim();
          if (trimmed === "") return false;
          const n = Number(trimmed);
          return Number.isFinite(n);
        }
        return false;
      }

      case "text":
      case "select":
      case "imageChoice":
      case "date":
        return typeof v === "string" && v.trim().length > 0;

      default:
        return false;
    }
  };

  const getProgress = (subset: Question[]) => {
    const isRequired = (q: Question) => q.required !== false;
    const requiredQs = subset.filter(isRequired);
    const total = requiredQs.length || 1;
    const answered = requiredQs.filter((q) => isAnswered(q, formData)).length;
    return Math.round((answered / total) * 100);
  };

  const handleChange = (
    name: keyof FormData,
    value: string | number | string[],
    type: Question["type"]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const isEmpty =
        (Array.isArray(value) && value.length === 0) ||
        value === "" ||
        value === undefined ||
        value === null;

      if (isEmpty) {
        delete updated[name];
      } else {
        updated[name] = value as never;
      }

      return updated;
    });

    if (["select", "date", "imageChoice"].includes(type)) {
      scrollToNextOrButtons(name);
    }
  };

  const handleEnterAdvance = (e: React.KeyboardEvent, q: Question) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (["number", "multiSelect", "text"].includes(q.type))
      scrollToNextOrButtons(q.name);
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length) return setFormErrors(errors);

    setFormErrors({});
    setLoading(true);
    try {
      const response = await submit(formData as FormData);
      setResult({ ...response, dob: formData.dob! });
      navigate("/life-expectancy-result");
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Reset all answers and clear saved data?")) return;
    setFormData({});
    setFormErrors({});
    setCurrentSectionIndex(0);
    localStorage.removeItem("longevityFormData");
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  };

  const scrollToSection = (index: number) => setCurrentSectionIndex(index);

  const sharedProps = (q: Question, value: FieldValue) => ({
    id: q.name,
    name: q.name,
    value,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => handleChange(q.name, e.target.value, q.type),
    onKeyDown: (e: React.KeyboardEvent) => handleEnterAdvance(e, q),
    className: "mt-4 border rounded px-3 py-2 w-full max-w-md",
    "aria-labelledby": `${q.name}-label`,
  });

  const renderField = (q: Question) => {
    const value: FieldValue = formData[q.name] ?? "";

    if (q.type === "imageChoice" && q.options) {
      const selected = formData[q.name];
      return (
        <fieldset aria-labelledby={`${q.name}-label`} role="radiogroup">
          <legend id={`${q.name}-label`} className={fieldLabel}>
            {q.label}
          </legend>
          <div className="flex gap-6 mt-10">
            {q.options.map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={selected === opt}
                aria-label={opt}
                onClick={() => handleChange(q.name, opt, q.type)}
                className={`border-2 rounded-lg p-2 transition ${
                  selected === opt
                    ? "border-blue-500"
                    : "border-blue-100 hover:border-blue-300"
                }`}
              >
                <img
                  src={`/images/${opt}.png`}
                  alt={opt}
                  className="w-32 h-32 object-contain"
                />
              </button>
            ))}
          </div>
        </fieldset>
      );
    }

    if (q.type === "select" && q.options) {
      return (
        <>
          <label htmlFor={q.name} id={`${q.name}-label`} className={fieldLabel}>
            {q.label}
          </label>
          <select {...sharedProps(q, value)}>
            <option value="" disabled>
              Select an option
            </option>
            {q.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </>
      );
    }

    if (q.type === "multiSelect" && q.options) {
      const selectedValues = (formData[q.name] as string[]) || [];
      const toggle = (opt: string, checked: boolean) => {
        const next = checked
          ? Array.from(new Set([...selectedValues, opt]))
          : selectedValues.filter((v) => v !== opt);
        handleChange(q.name, next, q.type);
      };
      return (
        <fieldset aria-labelledby={`${q.name}-label`} className="mb-4">
          <legend id={`${q.name}-label`} className={fieldLabel}>
            {q.label}
          </legend>
          <div className="flex flex-col gap-2 max-w-md">
            {q.options.map((opt) => (
              <label
                key={opt}
                className="inline-flex items-center cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  name={q.name}
                  value={opt}
                  checked={selectedValues.includes(opt)}
                  onChange={(e) => toggle(opt, e.target.checked)}
                  className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    return (
      <>
        <label htmlFor={q.name} id={`${q.name}-label`} className={fieldLabel}>
          {q.label}
        </label>
        <input
          type={q.type}
          {...sharedProps(q, value)}
          min={["weight", "height"].includes(q.name as string) ? 0 : undefined}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          role={q.type === "date" ? "textbox" : "spinbutton"}
        />
      </>
    );
  };

  const showBack = currentSectionIndex > 0;
  const showNext = !isLastSection;
  const justifyContentClass =
    showBack && showNext
      ? "justify-between"
      : showBack
      ? "justify-start"
      : "justify-end";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-10 md:px-20 relative z-10">
      {/* Progress Bars + Reset */}
      <div className="flex flex-wrap items-center gap-4 sticky top-[88px] z-40 bg-white py-4 px-3">
        {questionSections.map(({ label, questions }, i) => {
          const active = currentSectionIndex === i;
          const pct = getProgress(questions);

          return (
            <div
              key={label}
              role="button"
              tabIndex={0}
              onClick={() => scrollToSection(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  scrollToSection(i);
                }
              }}
              className="min-w-[150px] rounded-md transition-colors px-3 py-2 cursor-pointer select-none outline-none"
              style={{
                backgroundColor: active ? hoverBgColors[i] : undefined,
                color: active ? brightColors[i] : "rgba(100, 116, 139, 1)",
              }}
              aria-label={`Go to ${label} section`}
            >
              <div className="flex flex-col">
                <p
                  className="text-sm mb-1 flex items-center justify-center font-semibold text-center"
                  style={{ minHeight: 36 }}
                >
                  {label}
                </p>

                {/* Track is neutral; fill shows progress */}
                <div
                  className="h-2 rounded bg-slate-200"
                  role="progressbar"
                  aria-label={`${label} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  title={`${pct}%`}
                >
                  <div
                    className="h-2 rounded transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: brightColors[i],
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Reset button */}
        <button
          type="button"
          onClick={handleReset}
          className="ml-auto text-xs sm:text-sm rounded-md border px-3 py-1 font-medium text-slate-600 hover:bg-slate-50 active:scale-[0.98]"
          aria-label="Reset form and clear saved answers"
        >
          Reset form
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-24 scroll-smooth">
        {currentSection.questions.map((q) => (
          <section
            key={q.name}
            ref={(el) => {
              fieldRefs.current[q.name] = el;
            }}
            className="min-h-screen flex flex-col justify-center transition-opacity duration-300"
          >
            <div className="mb-[25px] font-figtree">
              {renderField(q)}
              {formErrors[q.name] && (
                <p className="text-red-600 text-sm mt-2">
                  {formErrors[q.name]}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom navigation */}
      <div
        ref={buttonsRef}
        className={`flex items-center mt-8 ${justifyContentClass}`}
      >
        {showBack && (
          <button
            type="button"
            onClick={() => scrollToSection(currentSectionIndex - 1)}
            className="cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors"
            style={{
              backgroundColor: hoverBgColors[currentSectionIndex - 1],
              color: brightColors[currentSectionIndex - 1],
            }}
            aria-label={`Go to ${
              questionSections[currentSectionIndex - 1].label
            } section`}
          >
            ← {questionSections[currentSectionIndex - 1].label}
          </button>
        )}

        {showNext && (
          <button
            type="button"
            onClick={() => scrollToSection(currentSectionIndex + 1)}
            className="cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors"
            style={{
              backgroundColor: hoverBgColors[currentSectionIndex + 1],
              color: brightColors[currentSectionIndex + 1],
            }}
            aria-label={`Go to ${
              questionSections[currentSectionIndex + 1].label
            } section`}
          >
            {questionSections[currentSectionIndex + 1].label} →
          </button>
        )}

        {isLastSection && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`ml-auto cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label="Submit form"
          >
            {loading ? "Submitting…" : "Submit"}
          </button>
        )}
      </div>
    </main>
  );
}
