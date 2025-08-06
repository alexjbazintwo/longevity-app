export interface FitnessDeclineData {
  muscleMassDecline: Record<number, number>;
  strengthDecline: Record<number, number>;
  vo2MaxDecline: Record<number, number>;
  estimatedPeakMuscleMass: number;
  estimatedPeakStrength: number;
  estimatedPeakVo2Max: number;
}

export interface LongevityResult {
  predictedLifeExpectancy: number;
  predictedLastHealthyAge: number;
  averageLifeExpectancyInCountry: number;
  percentageChanceOfReaching100: number;
  comparison: string;
  advice: string;

  fitnessDecline: FitnessDeclineData; // ✅ NEW
}
