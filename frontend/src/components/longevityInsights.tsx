import type { LongevityResult } from "../types/longevityResult";
import LongevityChart from "./longevityChart";

interface Props {
  result: LongevityResult;
  dob: string;
}

export default function LongevityInsights({ result, dob }: Props) {
  const dobDate = new Date(dob);
  const currentAge =
    !isNaN(dobDate.getTime()) && dob
      ? new Date().getFullYear() - dobDate.getFullYear()
      : null;

  return (
    <section className="bg-green-50 p-6 rounded shadow text-gray-800">
      <h3 className="text-2xl font-semibold mb-6">Your Longevity Insights</h3>

      <div className="space-y-4">
        <section>
          <h4 className="text-lg font-medium text-gray-700 mb-1">Comparison</h4>
          <p className="text-gray-800">{result.comparison}</p>
        </section>

        <section>
          <h4 className="text-lg font-medium text-gray-700 mb-1">Advice</h4>
          <p className="text-gray-800 whitespace-pre-line">{result.advice}</p>
        </section>

        <section>
          <h4 className="text-lg font-medium text-gray-700 mb-1">
            Chance of reaching 100
          </h4>
          <p className="text-gray-800">
            {result.percentageChanceOfReaching100}%
          </p>
        </section>

        <section>
          <h4 className="text-lg font-medium text-gray-700 mb-1">
            Your predicted life expectancy
          </h4>
          <p className="text-gray-800">
            {result.predictedLifeExpectancy} years
          </p>
        </section>

        <section>
          <h4 className="text-lg font-medium text-gray-700 mb-1">
            Healthy until age
          </h4>
          <p className="text-gray-800">
            {result.predictedLastHealthyAge} years
          </p>
        </section>

        <section>
          <h4 className="text-lg font-medium text-gray-700 mb-1">
            Country average life expectancy
          </h4>
          <p className="text-gray-800">
            {result.averageLifeExpectancyInCountry} years
          </p>
        </section>
      </div>

      {currentAge !== null && (
        <div className="overflow-x-auto mt-10">
          <div className="min-w-[300px] max-w-full">
            <LongevityChart
              currentAge={currentAge}
              predictedLifeExpectancy={result.predictedLifeExpectancy}
              averageLifeExpectancyInCountry={
                result.averageLifeExpectancyInCountry
              }
              percentageChanceOfReaching100={
                result.percentageChanceOfReaching100
              }
              predictedLastHealthyAge={result.predictedLastHealthyAge}
            />
          </div>
        </div>
      )}
    </section>
  );
}
