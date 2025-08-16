import LifeExpectancyChart from "./lifeExpectancyChart";
import type { LongevityPredictionResponse } from "../types/longevity/longevityResult";

interface LongevityInsightsProps {
  result: LongevityPredictionResponse;
  dob: string;
}

export default function LongevityInsights({
  result,
  dob,
}: LongevityInsightsProps) {
  const getCurrentAge = () => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    return hasHadBirthdayThisYear ? age : age - 1;
  };

  const currentAge = getCurrentAge();

  const currentLE = result.current.longevity.predictedLifeExpectancy;
  const potentialLE = result.potential.longevity.potentialLifeExpectancy;
  const yearsGained = potentialLE - currentLE;

  return (
    <main className="mt-16 max-w-6xl mx-auto px-6 font-figtree">
      <h1 className="text-4xl sm:text-5xl font-bold text-center text-gray-800 mb-4 tracking-tight">
        Your Longevity Journey
      </h1>

      {/* Life Extension Highlight */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-blue-200 shadow-md rounded-2xl px-6 py-5 text-center mb-10">
        <p className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
          Your current life expectancy is{" "}
          <span className="font-bold text-blue-600">
            {result.current.longevity.predictedLifeExpectancy} years
          </span>
          .
        </p>
        <p className="text-lg sm:text-xl font-medium text-gray-800">
          You could add{" "}
          <span className="font-bold text-green-600">{yearsGained} years</span>{" "}
          to your life with improved lifestyle choices.
        </p>
      </div>

      <LifeExpectancyChart
        currentAge={currentAge}
        predictedLifeExpectancy={currentLE}
        potentialLifeExpectancy={potentialLE}
        currentChanceAt100={
          result.current.longevity.percentageChanceOfReaching100
        }
        potentialChanceAt100={
          result.potential.longevity.potentialPercentageChanceOfReaching100
        }
        currentSurvivalTrajectory={result.current.longevity.survivalTrajectory}
        potentialSurvivalTrajectory={
          result.potential.longevity.potentialSurvivalTrajectory
        }
      />
    </main>
  );
}
