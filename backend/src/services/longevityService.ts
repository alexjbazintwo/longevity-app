import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import { LongevityFormData } from "../types/formData";
import { LongevityResult } from "../types/longevityResult";
import { buildLongevityPrompt } from "../utils/buildPrompt";
import { mockedLongevityResult } from "../mocks/longevityMock";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function estimateLongevity(
  form: LongevityFormData
): Promise<LongevityResult> {
  if (process.env.MOCK_OPENAI === "true") {
    console.log("🔁 Using mocked OpenAI response");
    return mockedLongevityResult;
  }

  const prompt = buildLongevityPrompt(form);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a longevity expert. Return only clean JSON with no markdown or explanations.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0].message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  try {
    const parsed = JSON.parse(content.trim());
    return parsed as LongevityResult;
  } catch (err) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Malformed AI response");
  }
}
