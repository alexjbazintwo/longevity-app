import { LongevityFormData } from "../types/longevityForm";
import { buildLongevityPrompt } from "../utils/buildPrompt";
import { callOpenAI } from "../utils/openai";
import { HealthPredictionResult } from "../types/longevityResult";
import { mockedHealthPredictionResult } from "../mocks/longevityMock";

export async function estimateLongevity(
  form: LongevityFormData,
  seed: string // new second param
): Promise<HealthPredictionResult> {
  const useMock = process.env.MOCK_OPENAI === "true";

  if (useMock) {
    return mockedHealthPredictionResult;
  }

  const prompt = buildLongevityPrompt(form);

  const aiResponse = await callOpenAI(prompt, {
    seed: parseInt(seed.slice(0, 8), 16),
    temperature: 0,
  });

  return aiResponse;
}
