import type { FormData } from "../types/longevityForm";
import type { LongevityPredictionResponse } from "../types/longevityResult";

export function useSubmitForm() {
  const submit = async (
    formData: FormData
  ): Promise<LongevityPredictionResponse> => {
    const res = await fetch("/api/longevity/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("API request failed");
    }

    const result = await res.json();
    return result as LongevityPredictionResponse;
  };

  return { submit };
}
