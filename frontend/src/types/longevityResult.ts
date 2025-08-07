export interface LongevitySurvivalPoint {
  age: number;
  chance: number;
}

export interface LongevityResult {
  predictedLifeExpectancy: number;
  predictedLastHealthyAge: number;
  averageLifeExpectancyInCountry: number;
  percentageChanceOfReaching100: number;
  comparison: string;
  advice: string;
  survivalTrajectory: LongevitySurvivalPoint[];
}

export interface PotentialLongevityResult {
  potentialLifeExpectancy: number;
  potentialLastHealthyAge: number;
  potentialPercentageChanceOfReaching100: number;
  potentialHealthyYearsGained: number;
  potentialSurvivalTrajectory: LongevitySurvivalPoint[];
}

export interface FitnessTrajectoryPoint {
  age: number;
  value: number;
}

export interface Vo2MaxTrajectory {
  currentValue: number;
  trajectory: FitnessTrajectoryPoint[];
}

export interface StrengthTrajectory {
  currentPercent: number;
  trajectory: FitnessTrajectoryPoint[];
}

export interface FitnessDecline {
  vo2Max: Vo2MaxTrajectory;
  strength: StrengthTrajectory;
}

export interface LongevityPredictionResponse {
  current: {
    longevity: LongevityResult;
    fitness: FitnessDecline;
  };
  potential: {
    longevity: PotentialLongevityResult;
  };
}
