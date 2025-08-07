import { LongevityFormData } from "../types/longevityForm";
import { buildLongevityPrompt } from "../utils/buildPrompt";
import { callOpenAI } from "../utils/openai";
import { HealthPredictionResult } from "../types/longevityResult";
import { mockedHealthPredictionResult } from "../mocks/longevityMock";

export async function estimateLongevity(
  form: LongevityFormData
): Promise<HealthPredictionResult> {
  const useMock = process.env.MOCK_OPENAI === "true";

  if (useMock) {
    return mockedHealthPredictionResult;
  }

  const prompt = buildLongevityPrompt(form);
  const aiResponse = await callOpenAI(prompt);

  return aiResponse;
}
