import { getNames } from "country-list";
import type { Question } from "../types/longevityForm";

const preferredCountry = "United Kingdom";
const allCountries = getNames()
  .filter((c: string) => c !== preferredCountry)
  .sort();
const countryOptions = [preferredCountry, ...allCountries];

export const aboutYou: Question[] = [
  {
    name: "sex",
    label: "Sex:",
    type: "imageChoice",
    options: ["male", "female"],
  },
  {
    name: "dob",
    label: "Date of Birth:",
    type: "date",
  },
  {
    name: "country",
    label: "Which country do you live in?",
    type: "select",
    options: countryOptions,
  },
  {
    name: "weight",
    label: "What is your weight (kg)?",
    type: "number",
  },
  {
    name: "height",
    label: "What is your height (cm)?",
    type: "number",
  },
  {
    name: "waistCircumference",
    label: "What is your waist circumference (cm)?",
    type: "number",
  },
];

export const lifestyleAndActivity: Question[] = [
  {
    name: "strengthTrainingHours",
    label:
      "How many hours per week do you do strength or resistance training (e.g. weights, bodyweight exercises, resistance bands)?",
    type: "number",
  },
  {
    name: "lightAerobicHours",
    label:
      "How many hours per week do you spend doing light physical activity (e.g. walking, gardening, household chores) that slightly raises your heart rate but does not leave you out of breath?",
    type: "number",
  },
  {
    name: "intenseAerobicHours",
    label:
      "How many hours per week do you do moderate to vigorous aerobic exercise (e.g. running, swimming, cycling, fitness classes) that makes you breathe faster or feel out of breath?",
    type: "number",
  },
  {
    name: "averageStepsPerDay",
    label: "On average, how many steps do you walk per day? (optional)",
    type: "number",
  },
  {
    name: "pushupCapacity",
    label:
      "Roughly how many full push-ups (on your toes, not knees) can you do in one go?",
    type: "number",
  },
  {
    name: "fruitVegIntake",
    label:
      "How many servings of fruit and vegetables do you eat per day (1 serving = 1 handful or ~80g)?",
    type: "number",
  },
  {
    name: "processedFoodIntake",
    label: "How often do you eat processed or fast food?",
    type: "select",
    options: ["rarely", "1–2 times/week", "3–5 times/week", "daily"],
  },
  {
    name: "alcoholUnitsPerWeek",
    label:
      "Roughly how many units of alcohol do you drink per week? (1 unit = 10ml of pure alcohol, e.g. 1 pint of beer = 2 units, 1 glass of wine = 2 units, 1 shot of spirits = 1 unit)",
    type: "number",
  },
  {
    name: "smoking",
    label: "Do you smoke?",
    type: "select",
    options: ["no", "occasionally", "regularly"],
  },
];

export const healthAndHistory: Question[] = [
  {
    name: "medicalConditions",
    label: "Do you have any of the following diagnosed medical conditions?",
    type: "multiSelect",
    options: [
      "Heart disease",
      "High blood pressure",
      "Stroke",
      "Type 2 diabetes",
      "Chronic kidney disease",
      "Cancer",
      "Obesity (BMI > 30)",
      "Chronic respiratory disease (e.g. COPD)",
      "Depression or anxiety",
      "None",
    ],
  },
  {
    name: "familyHistory",
    label:
      "Does anyone in your immediate family (parents or siblings) have a history of any of the following?",
    type: "multiSelect",
    options: [
      "Heart disease",
      "Stroke",
      "Cancer",
      "Type 2 diabetes",
      "Dementia",
      "None",
    ],
  },
  {
    name: "sleepHours",
    label: "How many hours of sleep do you get per night?",
    type: "number",
  },
  {
    name: "sleepQuality",
    label: "How would you rate your sleep quality?",
    type: "select",
    options: ["excellent", "good", "fair", "poor"],
  },
  {
    name: "stressLevel",
    label: "What is your stress level?",
    type: "select",
    options: ["low", "moderate", "high"],
  },
];

export const socialAndMindset: Question[] = [
  {
    name: "socialConnection",
    label: "How strong are your social connections?",
    type: "select",
    options: ["strong", "average", "poor"],
  },
  {
    name: "lonelinessFrequency",
    label: "How often do you feel lonely or isolated?",
    type: "select",
    options: ["never", "sometimes", "often", "always"],
  },
  {
    name: "incomeBracket",
    label: "What is your income bracket?",
    type: "select",
    options: ["low", "middle", "high"],
  },
  {
    name: "educationLevel",
    label: "Your highest education level?",
    type: "select",
    options: ["none", "high school", "bachelor", "master", "phd"],
  },
  {
    name: "jobType",
    label: "What best describes your job?",
    type: "select",
    options: ["sedentary", "light activity", "active/manual labour"],
  },
  {
    name: "willingnessToChange",
    label: "How willing are you to change your habits?",
    type: "select",
    options: ["low", "moderate", "high"],
  },
];

export const questionSections = [
  { id: "aboutYou", label: "About You", questions: aboutYou },
  {
    id: "lifestyleAndActivity",
    label: "Lifestyle and Activity",
    questions: lifestyleAndActivity,
  },
  {
    id: "healthAndHistory",
    label: "Health and History",
    questions: healthAndHistory,
  },
  {
    id: "socialAndMindset",
    label: "Social and Mindset",
    questions: socialAndMindset,
  },
];
