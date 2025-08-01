// backend/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";


dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {
  try {
    const form = req.body;

    const prompt = buildLongevityPrompt(form);

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: `You are a longevity expert who gives highly personalized, friendly and evidence-based estimates of life expectancy and healthy years.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ],
  temperature: 0.7,
});


    const result = completion.choices[0].message?.content;
    res.json({ result });
  } catch (error) {
    console.error("Error in /generate:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

function buildLongevityPrompt(data: any): string {
  return `
I want you to estimate someone's current life expectancy and healthy years remaining based on the following information:

- Age: ${data.age}
- Gender: ${data.gender}
- Country: ${data.country}
- Weight: ${data.weight} kg
- Height: ${data.height} cm
- Diet Quality: ${data.dietQuality}
- Exercise: ${data.exercise}
- Smoking: ${data.smoking}
- Alcohol: ${data.alcohol}
- Sleep Quality: ${data.sleepQuality}
- Stress Level: ${data.stressLevel}
- Medical Conditions: ${data.medicalConditions}
- Social Connection: ${data.socialConnection}
- Income Bracket: ${data.incomeBracket}
- Education Level: ${data.educationLevel}
- Willingness to Change: ${data.willingnessToChange}

Please return:

1. An estimated total life expectancy (e.g. 84 years)
2. An estimated number of healthy years (e.g. 71 years)
3. A short paragraph comparing this person to national averages
4. Advice on one or two impactful improvements based on their input

Be encouraging but honest. Format it clearly so it can be shown in a UI.
  `.trim();
}

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
