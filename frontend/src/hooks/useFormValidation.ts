import type { FormData } from "../types";
import { questions } from "../data/questions";

export const validateForm = (formData: Partial<FormData>) => {
  const errors: Record<string, string> = {};
  questions.forEach((q) => {
    if (!formData[q.name]) {
      errors[q.name] = "This field is required.";
    }
  });
  return errors;
};
