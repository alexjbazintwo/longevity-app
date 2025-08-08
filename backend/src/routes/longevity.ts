import express from "express";
import { estimateLongevity } from "../services/longevityService";
import { LongevityFormData } from "../types/longevityForm";
import { hashFormData } from "../utils/hash";
import { resultCache } from "../utils/cache";

const router = express.Router();

router.post("/estimate", async (req, res) => {
  try {
    const form: LongevityFormData = req.body;
    const hash = hashFormData(form);

    // Check cache first
    const cached = resultCache.get(hash);
    if (cached) {
      console.log(`📦 Returning cached result for hash: ${hash}`);
      return res.json(cached);
    }

    // Generate result using OpenAI
    const result = await estimateLongevity(form, hash);
    resultCache.set(hash, result);

    console.log("🔍 Longevity AI response:\n", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error("❌ Error in /api/longevity/estimate:", err);
    res.status(500).json({ error: "Failed to estimate longevity" });
  }
});

export default router;
