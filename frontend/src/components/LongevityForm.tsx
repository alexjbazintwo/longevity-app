import { useRef, useState, useEffect } from "react";

const questions = [
  {
    name: "sex",
    label: "Sex:",
    type: "imageChoice",
    options: ["male", "female"],
  },
  // {
  //   name: "gender",
  //   label: "What is your gender?",
  //   type: "select",
  //   options: ["male", "female", "other"],
  // },
  // { name: "country", label: "Which country do you live in?", type: "text" },
  // { name: "weight", label: "What is your weight (kg)?", type: "number" },
  // { name: "height", label: "What is your height (cm)?", type: "number" },
  // {
  //   name: "dietQuality",
  //   label: "How would you rate your diet?",
  //   type: "select",
  //   options: ["very healthy", "healthy", "average", "poor"],
  // },
  // { name: "exercise", label: "How often do you exercise?", type: "text" },
  // {
  //   name: "smoking",
  //   label: "Do you smoke?",
  //   type: "select",
  //   options: ["no", "occasionally", "regularly"],
  // },
  // {
  //   name: "alcohol",
  //   label: "How often do you drink alcohol?",
  //   type: "select",
  //   options: ["none", "moderate", "heavy"],
  // },
  // {
  //   name: "sleepQuality",
  //   label: "How would you rate your sleep quality?",
  //   type: "select",
  //   options: ["excellent", "good", "fair", "poor"],
  // },
  // {
  //   name: "stressLevel",
  //   label: "What is your stress level?",
  //   type: "select",
  //   options: ["low", "moderate", "high"],
  // },
  // {
  //   name: "medicalConditions",
  //   label: "Any medical conditions?",
  //   type: "textarea",
  // },
  // {
  //   name: "socialConnection",
  //   label: "How strong are your social connections?",
  //   type: "select",
  //   options: ["strong", "average", "poor"],
  // },
  // {
  //   name: "incomeBracket",
  //   label: "What is your income bracket?",
  //   type: "select",
  //   options: ["low", "middle", "high"],
  // },
  // {
  //   name: "educationLevel",
  //   label: "Your highest education level?",
  //   type: "select",
  //   options: ["none", "high school", "bachelor", "master", "phd"],
  // },
  // {
  //   name: "willingnessToChange",
  //   label: "How willing are you to change your habits?",
  //   type: "select",
  //   options: ["low", "moderate", "high"],
  // },
];

type FormData = Record<string, string | number>;

export default function LongevityForm() {
  const [formData, setFormData] = useState<FormData>({});
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.index))
          .sort((a, b) => a - b);

        if (visible.length > 0) {
          setCurrentVisibleIndex(visible[0]);
        }

        setVisibleIndexes(visible);
      },
      {
        root: null,
        threshold: 0.6,
      }
    );

    stepsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNext = () => {
    const next = stepsRef.current[currentVisibleIndex + 1];
    if (!next) return;

    next.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
      const input = next.querySelector(
        "input, select, textarea"
      ) as HTMLElement;
      input?.focus();
    }, 400);
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    questions.forEach((q) => {
      const value = formData[q.name];
      if (value === undefined || value === "") {
        newErrors[q.name] = "This field is required.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);

      const firstErrorIndex = questions.findIndex((q) =>
        Object.keys(newErrors).includes(q.name)
      );

      const firstErrorEl = stepsRef.current[firstErrorIndex];
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth" });
      }

      return;
    }

    setFormErrors({});
    setLoading(true);

    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    setResult(data.result);
    setLoading(false);

    setTimeout(() => {
      stepsRef.current[questions.length + 1]?.scrollIntoView({
        behavior: "smooth",
      });
    }, 300);
  };

  return (
    <main className="max-w-4xl mx-auto">
      <div className="px-4 sm:px-10 md:px-20 relative z-10">
        {questions.map((q, index) => {
          const isVisible = visibleIndexes.includes(index);

          return (
            <div
              key={q.name}
              data-index={index}
              ref={(el) => void (stepsRef.current[index] = el)}
              className={`min-h-screen flex flex-col justify-center transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-50"
              }`}
            >
              <label className="block font-light text-3xl leading-[35px] text-[#515151] mb-[25px] font-figtree">
                {q.label}

                {q.type === "imageChoice" ? (
                  <div className="flex gap-6 mt-10">
                    {q.options?.map((opt) => (
                      <button
                        key={opt}
                        type="button"
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
                ) : null}

                {formErrors[q.name] && (
                  <p className="text-red-600 text-sm mt-2">
                    {formErrors[q.name]}
                  </p>
                )}
              </label>
            </div>
          );
        })}

        {/* Submit section */}
        <div
          ref={(el) => void (stepsRef.current[questions.length] = el)}
          className="text-center"
        >
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? "Calculating..." : "Estimate Longevity"}
          </button>
        </div>

        {/* Result section */}
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
      </div>
    </main>
  );
}

