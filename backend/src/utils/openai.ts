import { OpenAIResponse } from "../types/openAiResponse";

export async function callOpenAI(prompt: string): Promise<OpenAIResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const json = await response.json();

  try {
    const content = json.choices?.[0]?.message?.content;
    const parsed: OpenAIResponse = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error("Failed to parse OpenAI response:", json);
    throw new Error("Invalid response from OpenAI");
  }
}
