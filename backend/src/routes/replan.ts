import { Router } from "express";
const router = Router({ mergeParams: true });

router.post("/", (req, res) => {
  const { id } = req.params as { id: string };
  return res.status(200).json({
    before: {
      weekIndex: 0,
      startDate: new Date().toISOString(),
      rampPercent: 0,
      intensityMix: { easy: 80, moderate: 15, hard: 5 },
      workouts: [],
      rationale: [],
    },
    after: {
      weekIndex: 0,
      startDate: new Date().toISOString(),
      rampPercent: 0,
      intensityMix: { easy: 80, moderate: 15, hard: 5 },
      workouts: [],
      rationale: [],
    },
    reasons: [`Stub replan for plan ${id}`],
  });
});

export default router;
