import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { questionSections } from "../data/questions";
import type { Question, FormData } from "../types/longevityForm";
import { useSubmitForm } from "../hooks/useSubmitForm";
import { validateForm } from "../hooks/useFormValidation";
import { useResultContext } from "../context/resultContext";

export default function LongevityForm() {
  const [formData, setFormData] = useState<Partial<FormData>>(() => {
    try {
      const stored = localStorage.getItem("longevityFormData");
      return stored ? JSON.parse(stored) : {};
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

  const currentSection = questionSections[currentSectionIndex];
  const isLastSection = currentSectionIndex === questionSections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Base bright colors for the progress bars (Tailwind CSS colors)
  const brightColors = [
    "rgb(37 99 235)", // blue-600
    "rgb(22 163 74)", // green-600
    "rgb(124 58 237)", // purple-600
    "rgb(249 115 22)", // orange-500 (closest bright orange)
  ];

  // Generate the subtle background color with alpha (~15% opacity)
  const hoverBgColors = brightColors.map(
    (rgb) => `rgba(${rgb.match(/\d+/g)?.join(", ")}, 0.15)`
  );

  useEffect(() => {
    localStorage.setItem("longevityFormData", JSON.stringify(formData));
  }, [formData]);

  // Scroll to first question of new section when section changes
  useEffect(() => {
    if (currentSection.questions.length > 0) {
      const firstQuestionName = currentSection.questions[0].name;
      const el = fieldRefs.current[firstQuestionName];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSectionIndex]);

  useEffect(() => {
    if (nextFieldToScrollTo && fieldRefs.current[nextFieldToScrollTo]) {
      const el = fieldRefs.current[nextFieldToScrollTo];
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
      setNextFieldToScrollTo(null);
      return () => cancelAnimationFrame(raf1);
    }
  }, [formData, nextFieldToScrollTo]);

  const getProgress = (subset: Question[]) => {
    const total = subset.length;
    const answered = subset.filter((q) => formData[q.name]).length;
    return Math.round((answered / total) * 100);
  };

  const handleNext = () => {
    const sectionQuestions = currentSection.questions;
    const errors = validateForm(formData, sectionQuestions);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      const firstInvalidKey = sectionQuestions.find(
        (q) => errors[q.name]
      )?.name;
      if (firstInvalidKey) {
        setNextFieldToScrollTo(firstInvalidKey);
      }

      return;
    }

    setFormErrors({});
    setCurrentSectionIndex((prev) =>
      Math.min(prev + 1, questionSections.length - 1)
    );
  };

  const handleBack = () => {
    setCurrentSectionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleChange = (
    name: string,
    value: string | number | string[],
    type: Question["type"]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (["select", "date", "imageChoice"].includes(type)) {
        const index = currentSection.questions.findIndex(
          (q) => q.name === name
        );
        const next = currentSection.questions[index + 1];
        if (next) {
          setNextFieldToScrollTo(next.name);
        } else if (buttonsRef.current) {
          buttonsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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

  const scrollToSection = (index: number) => {
    setCurrentSectionIndex(index);
  };

  const renderField = (q: Question) => {
    const value = formData[q.name] || "";

    const sharedProps = {
      id: q.name,
      name: q.name,
      value,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      ) => handleChange(q.name, e.target.value, q.type),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (["number", "multiSelect", "text"].includes(q.type)) {
            const index = currentSection.questions.findIndex(
              (qq) => qq.name === q.name
            );
            const next = currentSection.questions[index + 1];
            if (next) {
              setNextFieldToScrollTo(next.name);
            } else if (buttonsRef.current) {
              buttonsRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
        }
      },
      className: "mt-4 border rounded px-3 py-2 w-full max-w-md",
      "aria-labelledby": `${q.name}-label`,
    };

    if (q.type === "imageChoice" && q.options) {
      return (
        <fieldset aria-labelledby={`${q.name}-label`} role="radiogroup">
          <legend
            id={`${q.name}-label`}
            className="block font-light text-3xl leading-[35px] text-[#515151] mb-4"
          >
            {q.label}
          </legend>
          <div className="flex gap-6 mt-10">
            {q.options.map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={formData[q.name] === opt}
                aria-label={opt}
                onClick={() => handleChange(q.name, opt, q.type)}
                className={`border-2 rounded-lg p-2 transition ${
                  formData[q.name] === opt
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
          <label
            htmlFor={q.name}
            id={`${q.name}-label`}
            className="block font-light text-3xl leading-[35px] text-[#515151] mb-4"
          >
            {q.label}
          </label>
          <select {...sharedProps}>
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
      return (
        <>
          <label
            htmlFor={q.name}
            id={`${q.name}-label`}
            className="block font-light text-3xl leading-[35px] text-[#515151] mb-4"
          >
            {q.label}
          </label>
          <select
            {...sharedProps}
            multiple
            value={formData[q.name] || []}
            onChange={(e) =>
              handleChange(
                q.name,
                Array.from(e.target.selectedOptions).map((o) => o.value),
                q.type
              )
            }
          >
            {q.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </>
      );
    }

    return (
      <>
        <label
          htmlFor={q.name}
          id={`${q.name}-label`}
          className="block font-light text-3xl leading-[35px] text-[#515151] mb-4"
        >
          {q.label}
        </label>
        <input
          type={q.type}
          {...sharedProps}
          min={["weight", "height"].includes(q.name) ? 0 : undefined}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          role={q.type === "date" ? "textbox" : "spinbutton"}
        />
      </>
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-10 md:px-20 relative z-10">
      {/* Progress Bars Container */}
      <div className="flex flex-wrap gap-4 sticky top-[88px] z-40 bg-white py-4">
        {questionSections.map(({ label, questions }, i) => (
          <div
            key={label}
            className="flex-1 min-w-[150px] rounded-md transition-colors px-3 py-2"
            style={{
              backgroundColor:
                currentSectionIndex === i ? hoverBgColors[i] : undefined,
              color:
                currentSectionIndex === i
                  ? brightColors[i]
                  : "rgba(100, 116, 139, 1)" /* Tailwind gray-500 */,
            }}
          >
            {/* Wrap label and progress bar in a flex column with fixed label height */}
            <div className="flex flex-col">
              <p
                className="text-sm mb-1 flex items-center justify-center font-semibold select-none"
                style={{ minHeight: 36 }} // fix height to reserve space for 2 lines max
              >
                {label}
              </p>
              <div
                className="h-2 rounded"
                style={{ backgroundColor: brightColors[i] }}
              >
                <div
                  className="h-2 rounded transition-all"
                  style={{
                    width: `${getProgress(questions)}%`,
                    backgroundColor: brightColors[i],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {/* Bottom navigation: show previous and/or next section names */}
      <div ref={buttonsRef} className="flex justify-between items-center mt-8">
        {!isFirstSection && (
          <button
            type="button"
            onClick={() => scrollToSection(currentSectionIndex - 1)}
            className="cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors"
            style={{
              backgroundColor: hoverBgColors[currentSectionIndex - 1],
              color: brightColors[currentSectionIndex - 1],
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex - 1];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex - 1];
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex - 1];
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex - 1];
            }}
            aria-label={`Go to ${
              questionSections[currentSectionIndex - 1].label
            } section`}
          >
            ← {questionSections[currentSectionIndex - 1].label}
          </button>
        )}

        {!isLastSection && (
          <button
            type="button"
            onClick={() => scrollToSection(currentSectionIndex + 1)}
            className="cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors"
            style={{
              backgroundColor: hoverBgColors[currentSectionIndex + 1],
              color: brightColors[currentSectionIndex + 1],
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex + 1];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex + 1];
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex + 1];
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBgColors[currentSectionIndex + 1];
            }}
            aria-label={`Go to ${
              questionSections[currentSectionIndex + 1].label
            } section`}
          >
            {questionSections[currentSectionIndex + 1].label} →
          </button>
        )}
      </div>
    </main>
  );
}
