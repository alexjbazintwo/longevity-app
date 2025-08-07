import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aboutYou, healthBehaviour, questions } from "../data/questions";
import type { FormData } from "../types/longevityForm";
import { useSubmitForm } from "../hooks/useSubmitForm";
import { validateForm } from "../hooks/useFormValidation";
import { useScrollNavigation } from "../hooks/useScrollNavigation";
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

  const { submit } = useSubmitForm();
  const { setResult } = useResultContext();
  const navigate = useNavigate();
  const { stepsRef, currentVisibleIndex, visibleIndexes, scrollToStep } =
    useScrollNavigation();

  useEffect(() => {
    localStorage.setItem("longevityFormData", JSON.stringify(formData));
  }, [formData]);

  const getProgress = (subset: typeof questions) => {
    const total = subset.length;
    const answered = subset.filter((q) => formData[q.name]).length;
    return Math.round((answered / total) * 100);
  };

  const handleNext = () => scrollToStep(currentVisibleIndex + 1);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorIndex = questions.findIndex((q) => errors[q.name]);
      scrollToStep(firstErrorIndex);
      return;
    }

    setFormErrors({});
    setLoading(true);
    try {
      const response = await submit(formData as FormData);
      setResult({ ...response, dob: formData.dob! }); // save full result + dob
      navigate("/life-expectancy-result");
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (q: (typeof questions)[number]) => {
    const value = formData[q.name] || "";
    const sharedProps = {
      id: q.name,
      name: q.name,
      value,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      ) => handleChange(q.name, e.target.value),
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
                onClick={() => {
                  handleChange(q.name, opt);
                  handleNext();
                }}
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
          <select
            {...sharedProps}
            role="combobox"
            onChange={(e) => {
              sharedProps.onChange(e);
              handleNext();
            }}
          >
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

    if (q.type === "textarea") {
      return (
        <>
          <label
            htmlFor={q.name}
            id={`${q.name}-label`}
            className="block font-light text-3xl leading-[35px] text-[#515151] mb-4"
          >
            {q.label}
          </label>
          <textarea {...sharedProps} rows={4} role="textbox" />
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
          min={q.name === "weight" || q.name === "height" ? 0 : undefined}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
          role={q.type === "date" ? "textbox" : "spinbutton"}
        />
      </>
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-10 md:px-20 relative z-10">
      <div className="flex gap-4 sticky top-[88px] z-40 bg-white py-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">About You</p>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${getProgress(aboutYou)}%` }}
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">Health Behaviour</p>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-green-500 rounded"
              style={{ width: `${getProgress(healthBehaviour)}%` }}
            />
          </div>
        </div>
      </div>

      {questions.map((q, index) => (
        <div
          key={q.name}
          data-index={index}
          ref={(el) => void (stepsRef.current[index] = el)}
          className={`min-h-screen flex flex-col justify-center transition-opacity duration-300 ${
            visibleIndexes.includes(index) ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="mb-[25px] font-figtree">
            {renderField(q)}
            {formErrors[q.name] && (
              <p className="text-red-600 text-sm mt-2">{formErrors[q.name]}</p>
            )}
          </div>
        </div>
      ))}

      <div
        ref={(el) => void (stepsRef.current[questions.length] = el)}
        className="text-center"
      >
        <button
          type="button"
          role="button"
          aria-label="Estimate Longevity"
          disabled={loading}
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {loading ? "Calculating..." : "Estimate Longevity"}
        </button>
      </div>
    </main>
  );
}
