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
  { name: "dob", label: "Date of Birth:", type: "date" },
  {
    name: "country",
    label: "Which country do you live in?",
    type: "select",
    options: countryOptions,
  },
];

export const healthBehaviour: Question[] = [
  { name: "weight", label: "What is your weight (kg)?", type: "number" },
  { name: "height", label: "What is your height (cm)?", type: "number" },
  {
    name: "dietQuality",
    label: "How would you rate your diet?",
    type: "select",
    options: ["very healthy", "healthy", "average", "poor"],
  },
  { name: "exercise", label: "How often do you exercise?", type: "text" },
  {
    name: "smoking",
    label: "Do you smoke?",
    type: "select",
    options: ["no", "occasionally", "regularly"],
  },
  {
    name: "alcohol",
    label: "How often do you drink alcohol?",
    type: "select",
    options: ["none", "moderate", "heavy"],
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
  {
    name: "medicalConditions",
    label: "Any medical conditions?",
    type: "textarea",
  },
  {
    name: "socialConnection",
    label: "How strong are your social connections?",
    type: "select",
    options: ["strong", "average", "poor"],
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
    name: "willingnessToChange",
    label: "How willing are you to change your habits?",
    type: "select",
    options: ["low", "moderate", "high"],
  },
];

export const questions: Question[] = [...aboutYou, ...healthBehaviour];
