export type Question = {
  name: keyof FormData;
  label: string;
  type: "imageChoice" | "date" | "select" | "number" | "text" | "textarea";
  options?: string[];
};

export type FormData = {
  sex: string;
  dob: string;
  country: string;
  weight: number | string;
  height: number | string;
  dietQuality: string;
  exercise: string;
  smoking: string;
  alcohol: string;
  sleepQuality: string;
  stressLevel: string;
  medicalConditions: string;
  socialConnection: string;
  incomeBracket: string;
  educationLevel: string;
  willingnessToChange: string;
};
