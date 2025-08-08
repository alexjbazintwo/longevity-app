import { OpenAIResponse } from "../types/openAiResponse";

interface OpenAIOptions {
  seed?: number;
  temperature?: number;
}

export async function callOpenAI(
  prompt: string,
  options: OpenAIOptions = {}
): Promise<OpenAIResponse> {
  const { seed, temperature = 0.7 } = options;

  const body: any = {
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature,
  };

  if (seed !== undefined) {
    body.seed = seed;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  try {
    const content = json.choices?.[0]?.message?.content;
    const parsed: OpenAIResponse = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse OpenAI response:", json);
    throw new Error("Invalid JSON response from OpenAI");
  }
}
