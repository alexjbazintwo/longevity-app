import { LongevityFormData } from "../types/longevityForm";

export function buildLongevityPrompt(data: LongevityFormData): string {
  const birthYear = new Date(data.dob).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  return `
You are a health and longevity expert.

Estimate the following person's current and potential future health and life expectancy based on their lifestyle, health history, and demographics:

Demographics:
- Age: ${age}
- Sex: ${data.sex}
- Country: ${data.country}
- Weight: ${data.weight} kg
- Height: ${data.height} cm
- Waist circumference: ${data.waistCircumference} cm

Lifestyle & Activity:
- Strength training hours/week: ${data.strengthTrainingHours}
- Light activity hours/week: ${data.lightAerobicHours}
- Intense aerobic hours/week: ${data.intenseAerobicHours}
- Average steps/day: ${data.averageStepsPerDay}
- Push-up capacity: ${data.pushupCapacity}
- Fruit & veg servings/day: ${data.fruitVegIntake}
- Processed food intake: ${data.processedFoodIntake}
- Alcohol units/week: ${data.alcoholUnitsPerWeek}
- Smoking status: ${data.smoking}

Health & History:
- Medical conditions: ${data.medicalConditions.join(", ") || "None"}
- Family history: ${data.familyHistory.join(", ") || "None"}
- Sleep duration (hours/night): ${data.sleepHours}
- Sleep quality: ${data.sleepQuality}
- Stress level: ${data.stressLevel}

Social & Mindset:
- Social connection strength: ${data.socialConnection}
- Loneliness frequency: ${data.lonelinessFrequency}
- Income bracket: ${data.incomeBracket}
- Education level: ${data.educationLevel}
- Job type: ${data.jobType}
- Willingness to change: ${data.willingnessToChange}

Return ONLY a raw JSON object with the following exact structure:

{
  "current": {
    "longevity": {
      "predictedLifeExpectancy": number,
      "predictedLastHealthyAge": number,
      "averageLifeExpectancyInCountry": number,
      "percentageChanceOfReaching100": number,
      "comparison": string,
      "advice": string,
      "survivalTrajectory": [
        { "age": number, "chance": number }
      ]
    },
    "fitness": {
      "vo2Max": {
        "currentValue": number,
        "trajectory": [
          { "age": number, "value": number }
        ]
      },
      "strength": {
        "currentPercent": number,
        "trajectory": [
          { "age": number, "value": number }
        ]
      }
    }
  },
  "potential": {
    "longevity": {
      "potentialLifeExpectancy": number,
      "potentialLastHealthyAge": number,
      "potentialPercentageChanceOfReaching100": number,
      "potentialHealthyYearsGained": number,
      "potentialSurvivalTrajectory": [
        { "age": number, "chance": number }
      ]
    }
  }
}

Constraints:
- Return 8–12 total points in each trajectory array (survival, vo2Max, strength), with denser values after age 60.
- Use realistic, smooth, **non-linear declines** over time.
- Avoid sudden drops in chance between two ages — all survival trajectories should resemble **sigmoid or exponential decay curves**, with gradual decline at first, steeper around life expectancy, and tapering off after.
- Ensure **no single drop exceeds 15%** in any 5-year span unless it's post-life expectancy.
- Each survivalTrajectory and potentialSurvivalTrajectory must include a point where chance is exactly 50 (representing life expectancy).
- All trajectories must include an endpoint at age 100 with chance/value 1 or less.
- Use whole numbers only (no decimals).
- Do not return any extra text, explanation, formatting, or markdown.
- Ensure the JSON is valid and directly parsable.
`.trim();
}
