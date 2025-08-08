export interface LongevityFormData {
  // Demographics
  sex: "male" | "female";
  dob: string;
  country: string;
  weight: number;
  height: number;
  waistCircumference: number;

  // Lifestyle & Activity
  strengthTrainingHours: number;
  lightAerobicHours: number;
  intenseAerobicHours: number;
  averageStepsPerDay?: number;
  pushupCapacity: number;
  fruitVegIntake: number;
  processedFoodIntake: "rarely" | "1–2 times/week" | "3–5 times/week" | "daily";
  alcoholUnitsPerWeek: number;
  smoking: "no" | "occasionally" | "regularly";

  // Health & History
  medicalConditions: string[]; // multiSelect
  familyHistory: string[]; // multiSelect
  sleepHours: number;
  sleepQuality: "excellent" | "good" | "fair" | "poor";
  stressLevel: "low" | "moderate" | "high";

  // Social & Mindset
  socialConnection: "strong" | "average" | "poor";
  lonelinessFrequency: "never" | "sometimes" | "often" | "always";
  incomeBracket: "low" | "middle" | "high";
  educationLevel: "none" | "high school" | "bachelor" | "master" | "phd";
  jobType: "sedentary" | "light activity" | "active/manual labour";
  willingnessToChange: "low" | "moderate" | "high";
}
