export const mockedLongevityResult = {
  predictedLifeExpectancy: 85,
  predictedLastHealthyAge: 78,
  averageLifeExpectancyInCountry: 81,
  percentageChanceOfReaching100: 12,
  comparison: "You are slightly above the average for your country.",
  advice: "Maintain regular physical activity, focus on sleep, etc.",
  fitnessDecline: {
    estimatedPeakMuscleMass: 32,
    estimatedPeakStrength: 100,
    estimatedPeakVo2Max: 48,
    muscleMassDecline: generateMockDecline(),
    strengthDecline: generateMockDecline(100),
    vo2MaxDecline: generateMockDecline(48),
  },
};

function generateMockDecline(peak = 100) {
  const decline: Record<number, number> = {};
  for (let age = 39; age <= 100; age++) {
    const percent = Math.max(peak - (age - 39) * 1, 30);
    decline[age] = parseFloat(percent.toFixed(2));
  }
  return decline;
}
