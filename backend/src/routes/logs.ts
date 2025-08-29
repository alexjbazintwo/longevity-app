import { Router } from "express";
const router = Router();

// POST /logs — accept a log, return 201 (stub)
router.post("/", (req, res) => {
  // TODO: validate & persist ActivityLog
  return res.status(201).json({ ok: true, received: req.body });
});

// GET /logs?from=...&to=... — return empty list (stub)
router.get("/", (_req, res) => {
  return res.json({ items: [] });
});

export default router;
