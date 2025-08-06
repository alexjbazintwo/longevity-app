import type { FormData } from "../types/longevityForm";
import type { LongevityResult } from "../types/longevityResult";

export const useSubmitForm = () => {
  const submit = async (formData: FormData): Promise<LongevityResult> => {
    const structured = {
      sex: formData.sex,
      dob: formData.dob,
      country: formData.country,
      weight: Number(formData.weight),
      height: Number(formData.height),
      dietQuality: formData.dietQuality,
      exercise: formData.exercise.trim(),
      smoking: formData.smoking,
      alcohol: formData.alcohol,
      sleepQuality: formData.sleepQuality,
      stressLevel: formData.stressLevel,
      medicalConditions: formData.medicalConditions.trim(),
      socialConnection: formData.socialConnection,
      incomeBracket: formData.incomeBracket,
      educationLevel: formData.educationLevel,
      willingnessToChange: formData.willingnessToChange,
    };

    const res = await fetch("http://localhost:3000/api/longevity/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(structured),
    });

    const data = await res.json();
    return data as LongevityResult;
  };

  return { submit };
};
