import express from "express";
import { estimateLongevity } from "../services/longevityService";
import { LongevityFormData } from "../types/longevityForm";

const router = express.Router();

router.post("/estimate", async (req, res) => {
  try {
    const form: LongevityFormData = req.body;
    const result = await estimateLongevity(form);
    console.log("🔍 Longevity AI response:\n", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error("Error in /api/longevity/estimate:", err);
    res.status(500).json({ error: "Failed to estimate longevity" });
  }
});

export default router;
