import { useRef, useState, useEffect } from "react";
import { getNames } from "country-list";

const preferredCountry = "United Kingdom";
const allCountries = getNames()
  .filter((c: string) => c !== preferredCountry)
  .sort();
const countryOptions = [preferredCountry, ...allCountries];

const aboutYou = [
  {
    name: "sex",
    label: "Sex:",
    type: "imageChoice",
    options: ["male", "female"],
  },
  { name: "dob", label: "Date of Birth:", type: "date" },
  {
    name: "country",
    label: "Which country do you live in?",
    type: "select",
    options: countryOptions,
  },
];

const healthBehaviour = [
  { name: "weight", label: "What is your weight (kg)?", type: "number" },
  { name: "height", label: "What is your height (cm)?", type: "number" },
  {
    name: "dietQuality",
    label: "How would you rate your diet?",
    type: "select",
    options: ["very healthy", "healthy", "average", "poor"],
  },
  { name: "exercise", label: "How often do you exercise?", type: "text" },
  {
    name: "smoking",
    label: "Do you smoke?",
    type: "select",
    options: ["no", "occasionally", "regularly"],
  },
  {
    name: "alcohol",
    label: "How often do you drink alcohol?",
    type: "select",
    options: ["none", "moderate", "heavy"],
  },
  {
    name: "sleepQuality",
    label: "How would you rate your sleep quality?",
    type: "select",
    options: ["excellent", "good", "fair", "poor"],
  },
  {
    name: "stressLevel",
    label: "What is your stress level?",
    type: "select",
    options: ["low", "moderate", "high"],
  },
  {
    name: "medicalConditions",
    label: "Any medical conditions?",
    type: "textarea",
  },
  {
    name: "socialConnection",
    label: "How strong are your social connections?",
    type: "select",
    options: ["strong", "average", "poor"],
  },
  {
    name: "incomeBracket",
    label: "What is your income bracket?",
    type: "select",
    options: ["low", "middle", "high"],
  },
  {
    name: "educationLevel",
    label: "Your highest education level?",
    type: "select",
    options: ["none", "high school", "bachelor", "master", "phd"],
  },
  {
    name: "willingnessToChange",
    label: "How willing are you to change your habits?",
    type: "select",
    options: ["low", "moderate", "high"],
  },
];

const questions = [...aboutYou, ...healthBehaviour];
type FormData = Record<string, string | number>;

export default function LongevityForm() {
  const [formData, setFormData] = useState<FormData>({});
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  const getProgress = (subset: typeof questions) => {
    const total = subset.length;
    const answered = subset.filter((q) => formData[q.name]).length;
    return Math.round((answered / total) * 100);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.index))
          .sort((a, b) => a - b);
        if (visible.length > 0) setCurrentVisibleIndex(visible[0]);
        setVisibleIndexes(visible);
      },
      { threshold: 0.6 }
    );

    stepsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNext = () => {
    const next = stepsRef.current[currentVisibleIndex + 1];
    if (!next) return;
    next.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      const input = next.querySelector(
        "input, select, textarea"
      ) as HTMLElement;
      input?.focus();
    }, 600);
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (!formData[q.name]) newErrors[q.name] = "This field is required.";
    });
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      const firstErrorIndex = questions.findIndex((q) => newErrors[q.name]);
      stepsRef.current[firstErrorIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setFormErrors({});
    setLoading(true);

    const structuredData = {
      sex: formData.sex,
      dob: formData.dob,
      country: formData.country,
      weight: Number(formData.weight),
      height: Number(formData.height),
      dietQuality: formData.dietQuality,
      exercise: String(formData.exercise || "").trim(),
      smoking: formData.smoking,
      alcohol: formData.alcohol,
      sleepQuality: formData.sleepQuality,
      stressLevel: formData.stressLevel,
      medicalConditions: String(formData.medicalConditions || "").trim(),
      socialConnection: formData.socialConnection,
      incomeBracket: formData.incomeBracket,
      educationLevel: formData.educationLevel,
      willingnessToChange: formData.willingnessToChange,
    };

    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(structuredData),
      });

      const data = await res.json();
      setResult(data.result);
      setTimeout(() => {
        stepsRef.current[questions.length + 1]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
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
      <div className="flex gap-4 px-4 sm:px-10 md:px-20 sticky top-[88px] z-40 bg-white py-4">
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

      {result && (
        <div
          ref={(el) => void (stepsRef.current[questions.length + 1] = el)}
          className="bg-green-50 p-6 rounded mt-10 shadow text-gray-800"
        >
          <h3 className="text-xl font-semibold mb-2">
            Your Life Expectancy Estimate
          </h3>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </main>
  );
}
