import { useEffect, useState } from "react";
import { useResultContext } from "../context/resultContext";
import LongevityInsights from "../components/longevityInsights";

export default function LongevityResult() {
  const { result } = useResultContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay, or remove if not needed
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  if (!result) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-10 md:px-20 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          No results available
        </h2>
        <p className="text-gray-600">
          Please complete the longevity form first.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-10 md:px-20 py-20 text-center">
        <div className="text-lg text-gray-700 animate-pulse">
          Calculating your results...
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-10 md:px-20 py-10">
      <LongevityInsights result={result.current.longevity} dob={result.dob} />
    </main>
  );
}
