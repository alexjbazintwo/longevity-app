import { HealthPredictionResult } from "../types/longevityResult";

export const mockedHealthPredictionResult: HealthPredictionResult = {
  current: {
    longevity: {
      predictedLifeExpectancy: 82,
      predictedLastHealthyAge: 74,
      averageLifeExpectancyInCountry: 79,
      percentageChanceOfReaching100: 14,
      comparison: "You are likely to outlive your national average.",
      advice: "Maintain regular exercise and reduce sugar intake.",
      survivalTrajectory: [
        { age: 40, chance: 99 },
        { age: 50, chance: 95 },
        { age: 60, chance: 88 },
        { age: 70, chance: 75 },
        { age: 80, chance: 50 },
        { age: 90, chance: 20 },
        { age: 100, chance: 14 },
      ],
    },
    fitness: {
      vo2Max: {
        currentValue: 42,
        trajectory: [
          { age: 40, value: 45 },
          { age: 50, value: 41 },
          { age: 60, value: 36 },
          { age: 70, value: 30 },
          { age: 80, value: 24 },
          { age: 90, value: 18 },
          { age: 100, value: 12 },
        ],
      },
      strength: {
        currentPercent: 88,
        trajectory: [
          { age: 40, value: 90 },
          { age: 50, value: 80 },
          { age: 60, value: 70 },
          { age: 70, value: 55 },
          { age: 80, value: 40 },
          { age: 90, value: 25 },
          { age: 100, value: 10 },
        ],
      },
    },
  },
  potential: {
    longevity: {
      potentialLifeExpectancy: 89,
      potentialLastHealthyAge: 80,
      potentialPercentageChanceOfReaching100: 35,
      potentialHealthyYearsGained: 6,
      potentialSurvivalTrajectory: [
        { age: 40, chance: 100 },
        { age: 50, chance: 98 },
        { age: 60, chance: 92 },
        { age: 70, chance: 83 },
        { age: 80, chance: 70 },
        { age: 90, chance: 50 },
        { age: 100, chance: 35 },
      ],
    },
  },
};
