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
    <section className="mt-10">
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
    </section>
  );
}
