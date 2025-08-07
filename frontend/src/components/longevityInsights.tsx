import LifeExpectancyChart from "./lifeExpectancyChart";
import type { LongevityPredictionResponse } from "../types/longevityResult";

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

  return (
    <main className="mt-16 max-w-6xl mx-auto px-6 font-figtree">
      <h1 className="text-4xl sm:text-5xl font-bold text-center text-gray-800 mb-4 tracking-tight">
        Your Longevity Journey
      </h1>

      <LifeExpectancyChart
        currentAge={currentAge}
        predictedLifeExpectancy={
          result.current.longevity.predictedLifeExpectancy
        }
        potentialLifeExpectancy={
          result.potential.longevity.potentialLifeExpectancy
        }
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
