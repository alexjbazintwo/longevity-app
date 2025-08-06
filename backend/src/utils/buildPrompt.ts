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

Return the result as **pure JSON** with the following fields:

{
  "predictedLifeExpectancy": number,
  "predictedLastHealthyAge": number,
  "averageLifeExpectancyInCountry": number,
  "percentageChanceOfReaching100": number,
  "comparison": string,
  "advice": string,

  "fitnessDecline": {
    "estimatedPeakMuscleMass": number, // in kg or % of body weight
    "estimatedPeakStrength": number,   // in kg or relative scale
    "estimatedPeakVo2Max": number,     // in ml/kg/min

    "muscleMassDecline": { [age: number]: number }, // % of peak from current age to 100
    "strengthDecline": { [age: number]: number },   // % of peak from current age to 100
    "vo2MaxDecline": { [age: number]: number }      // % of peak from current age to 100
  }
}

Assume the user performs **no regular exercise** from now until age 100.

No markdown. No commentary. Just clean JSON.
`.trim();
}
