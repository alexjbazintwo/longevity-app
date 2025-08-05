import { LongevityFormData } from "../types/formData";

export function buildLongevityPrompt(data: LongevityFormData): string {
  const birthYear = new Date(data.dob).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  return `
Estimate someone's longevity using the following input:

- Age: ${age}
- Gender: ${data.sex}
- Country: ${data.country}
- Weight: ${data.weight} kg
- Height: ${data.height} cm
- Diet Quality: ${data.dietQuality}
- Exercise: ${data.exercise}
- Smoking: ${data.smoking}
- Alcohol: ${data.alcohol}
- Sleep Quality: ${data.sleepQuality}
- Stress Level: ${data.stressLevel}
- Medical Conditions: ${data.medicalConditions}
- Social Connection: ${data.socialConnection}
- Income Bracket: ${data.incomeBracket}
- Education Level: ${data.educationLevel}
- Willingness to Change: ${data.willingnessToChange}

Return the result as **pure JSON**:
{
  "predictedLifeExpectancy": 85,
  "predictedLastHealthyAge": 74,
  "averageLifeExpectancyInCountry": 80,
  "percentageChanceOfReaching100": 22,
  "comparison": "Your estimated life expectancy is above average for a male in the UK.",
  "advice": "Keep up your healthy habits and consider more regular exercise."
}

No markdown. No commentary. Just clean JSON.
`.trim();
}
