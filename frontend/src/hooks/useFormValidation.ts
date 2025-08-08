import type { FormData, Question } from "../types/longevityForm";
export function validateForm(
  formData: Partial<FormData>,
  subset?: Question[]
): Record<keyof FormData, string> {
  const errors: Partial<Record<keyof FormData, string>> = {};

  const questionsToCheck = subset ?? ([] as Question[]);

  for (const q of questionsToCheck) {
    const value = formData[q.name];

    const isMissing =
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (isMissing) {
      errors[q.name] = "This field is required.";
    }
  }

  return errors as Record<keyof FormData, string>;
}
