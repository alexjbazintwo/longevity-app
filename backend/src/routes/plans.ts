import { Router } from "express";
import type { PlanInput } from "@shared/types/planning";
import { generateInitialPlan } from "../services/planning/generateInitialPlan";

const router = Router();

function isISODateString(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

router.post("/", (req, res) => {
  const body = req.body as Record<string, unknown>;

  const allowedKeys = new Set([
    "goal",
    "targetDate",
    "startDate",
    "currentWeeklyRunningMinutes",
    "longestRecentRunMinutes",
    "weeklyMinutesMax",
    "runsPerWeek",
    "includeMobility",
    "includeStrength",
    "constraints",
    "weekAnchorDay",
    "injuries",
    "medicalFlags",
  ]);

  const unsupported = Object.keys(body).filter((k) => !allowedKeys.has(k));

  const required: Array<keyof PlanInput> = [
    "goal",
    "startDate",
    "currentWeeklyRunningMinutes",
    "longestRecentRunMinutes",
    "weeklyMinutesMax",
    "runsPerWeek",
    "includeMobility",
    "includeStrength",
  ];

  const errors: string[] = [];

  for (const key of required) {
    if (body[key] == null) {
      errors.push(`Missing field: ${key}`);
    }
  }

  if (errors.length === 0) {
    const { goal, startDate, targetDate } = body;

    const validGoals = new Set([
      "5k",
      "10k",
      "Half",
      "Marathon",
      "Base",
      "ReturnToRun",
    ]);
    if (typeof goal !== "string" || !validGoals.has(goal)) {
      errors.push(
        `Invalid field: goal (expected one of ${Array.from(validGoals).join(
          ", "
        )})`
      );
    }

    if (!isISODateString(startDate)) {
      errors.push("Invalid field: startDate (expected ISO date string)");
    }
    if (targetDate != null && !isISODateString(targetDate)) {
      errors.push(
        "Invalid field: targetDate (expected ISO date string if provided)"
      );
    }

    const cwr = body.currentWeeklyRunningMinutes;
    if (typeof cwr !== "number" || !Number.isFinite(cwr) || cwr < 0) {
      errors.push(
        "Invalid field: currentWeeklyRunningMinutes (expected number ≥ 0, minutes)"
      );
    }

    const lrr = body.longestRecentRunMinutes;
    if (typeof lrr !== "number" || !Number.isFinite(lrr) || lrr < 0) {
      errors.push(
        "Invalid field: longestRecentRunMinutes (expected number ≥ 0, minutes)"
      );
    }

    const wmm = body.weeklyMinutesMax;
    if (typeof wmm !== "number" || !Number.isFinite(wmm) || wmm <= 0) {
      errors.push(
        "Invalid field: weeklyMinutesMax (expected number > 0, minutes)"
      );
    }

    const rpw = body.runsPerWeek;
    if (
      typeof rpw !== "number" ||
      !Number.isInteger(rpw) ||
      rpw < 1 ||
      rpw > 7
    ) {
      errors.push("Invalid field: runsPerWeek (expected integer 1–7)");
    }

    const im = body.includeMobility;
    const is = body.includeStrength;
    if (typeof im !== "boolean")
      errors.push("Invalid field: includeMobility (expected boolean)");
    if (typeof is !== "boolean")
      errors.push("Invalid field: includeStrength (expected boolean)");

    if (body.weekAnchorDay != null) {
      const wad = body.weekAnchorDay;
      if (
        !Number.isInteger(wad) ||
        (wad as number) < 0 ||
        (wad as number) > 6
      ) {
        errors.push(
          "Invalid field: weekAnchorDay (expected integer 0–6; 0=Sun..6=Sat)"
        );
      }
    }

    if (body.constraints != null) {
      const c = body.constraints as Record<string, unknown>;
      if (typeof c !== "object" || Array.isArray(c)) {
        errors.push("Invalid field: constraints (expected object)");
      } else {
        if (c.daysUnavailable != null) {
          const du = c.daysUnavailable;
          const okArray =
            Array.isArray(du) &&
            du.every(
              (x) =>
                Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 6
            );
          if (!okArray) {
            errors.push(
              "Invalid field: constraints.daysUnavailable (expected array of integers 0–6)"
            );
          }
        }
        if (c.longRunDay != null) {
          const lrd = c.longRunDay;
          if (
            !Number.isInteger(lrd) ||
            (lrd as number) < 0 ||
            (lrd as number) > 6
          ) {
            errors.push(
              "Invalid field: constraints.longRunDay (expected integer 0–6)"
            );
          }
        }
      }
    }

    if (body.injuries != null) {
      if (
        !Array.isArray(body.injuries) ||
        !body.injuries.every((s) => typeof s === "string")
      ) {
        errors.push("Invalid field: injuries (expected array of strings)");
      }
    }
    if (body.medicalFlags != null) {
      if (
        !Array.isArray(body.medicalFlags) ||
        !body.medicalFlags.every((s) => typeof s === "string")
      ) {
        errors.push("Invalid field: medicalFlags (expected array of strings)");
      }
    }
  }

  if (unsupported.length > 0) {
    errors.push(`Unsupported fields: ${unsupported.join(", ")}`);
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ error: "Invalid request body", details: errors });
  }

  const sanitized: PlanInput = {
    goal: body.goal as PlanInput["goal"],
    targetDate: (body.targetDate as string | undefined) ?? undefined,
    startDate: body.startDate as string,
    currentWeeklyRunningMinutes: body.currentWeeklyRunningMinutes as number,
    longestRecentRunMinutes: body.longestRecentRunMinutes as number,
    weeklyMinutesMax: body.weeklyMinutesMax as number,
    runsPerWeek: body.runsPerWeek as number,
    includeMobility: body.includeMobility as boolean,
    includeStrength: body.includeStrength as boolean,
    constraints: body.constraints as PlanInput["constraints"],
    weekAnchorDay: (body.weekAnchorDay as number | undefined) ?? undefined,
    injuries: (body.injuries as string[]) ?? undefined,
    medicalFlags: (body.medicalFlags as string[]) ?? undefined,
  };

  try {
    const plan = generateInitialPlan({
      ...sanitized,
      userId: (req as any).userId,
    });
    return res.status(201).json(plan);
  } catch (err) {
    console.error("generateInitialPlan error:", err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
});

export default router;
