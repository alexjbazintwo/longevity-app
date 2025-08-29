import { randomUUID } from "crypto";
import type {
  Plan,
  PlanInput,
  WeekPlan,
  Workout,
} from "@shared/types/planning";

/** ---------- helpers ---------- */
function uid(): string {
  return randomUUID();
}

function getDow(dateISO: string): number {
  return new Date(dateISO).getDay(); // 0=Sun..6=Sat
}

function toStartOfDayISO(dateISO: string): string {
  const d = new Date(dateISO);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function addDaysISO(dateISO: string, n: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

/** First occurrence of given DOW on or after dateISO (00:00) */
function nextOnOrAfterDow(dateISO: string, dow: number): string {
  const d = new Date(toStartOfDayISO(dateISO));
  const cur = d.getDay();
  const delta = (dow - cur + 7) % 7;
  d.setDate(d.getDate() + delta);
  return d.toISOString();
}

/** Count days between two ISO dates (start inclusive, end exclusive) */
function daysBetween(startISO: string, endISO: string): number {
  const s = new Date(toStartOfDayISO(startISO)).getTime();
  const e = new Date(toStartOfDayISO(endISO)).getTime();
  return Math.max(0, Math.round((e - s) / (24 * 3600 * 1000)));
}

function sumMinutes(ws: Workout[]): number {
  return ws.reduce((acc, w) => acc + (w.durationMin ?? 0), 0);
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/** ---------- planning primitives ---------- */
function chooseRunDays(
  runsPerWeek: number,
  longRunDay: number | undefined,
  daysUnavailable: number[] | undefined
): number[] {
  const unavailable = new Set(daysUnavailable ?? []);
  const picked: number[] = [];
  const preference = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sat, Sun

  if (
    typeof longRunDay === "number" &&
    longRunDay >= 0 &&
    longRunDay <= 6 &&
    !unavailable.has(longRunDay)
  ) {
    picked.push(longRunDay);
  }
  for (const d of preference) {
    if (picked.length >= runsPerWeek) break;
    if (unavailable.has(d)) continue;
    if (picked.includes(d)) continue;
    picked.push(d);
  }
  return picked.slice(0, Math.max(0, runsPerWeek));
}

function decideQualitySlots(
  currentWeeklyRunningMinutes: number,
  runsPerWeek: number,
  longestRecentRunMinutes: number
): 0 | 1 | 2 {
  if (runsPerWeek < 3) return 0; // need ≥3 runs/week for any quality
  if (currentWeeklyRunningMinutes < 60 || longestRecentRunMinutes < 30)
    return 0;
  if (
    currentWeeklyRunningMinutes > 180 &&
    runsPerWeek >= 4 &&
    longestRecentRunMinutes >= 45
  ) {
    return 2;
  }
  return 1;
}

function absoluteLongRunCap(
  currentWeeklyRunningMinutes: number,
  longestRecentRunMinutes: number
): number {
  if (currentWeeklyRunningMinutes < 60 || longestRecentRunMinutes < 30)
    return 40;
  if (currentWeeklyRunningMinutes > 300 && longestRecentRunMinutes >= 90)
    return 90;
  return 60;
}

/** Cap the long run using RUNNING total (not including ancillaries). */
function longRunCapForRunningTotal(
  runningTotalMin: number,
  currentWeeklyRunningMinutes: number,
  longestRecentRunMinutes: number
): number {
  const pct35 = Math.floor(runningTotalMin * 0.35);
  const absCap = absoluteLongRunCap(
    currentWeeklyRunningMinutes,
    longestRecentRunMinutes
  );
  const historyCap = Math.max(0, Math.floor(longestRecentRunMinutes));
  return Math.max(10, Math.min(pct35, absCap, historyCap || absCap, 120));
}

/** Translate workouts to an intensity mix (%) based on zones and session types. */
function computeIntensityMix(workouts: Workout[]): {
  easy: number;
  moderate: number;
  hard: number;
} {
  const total = Math.max(1, sumMinutes(workouts));
  let easyMin = 0,
    moderateMin = 0,
    hardMin = 0;

  for (const w of workouts) {
    const min = w.durationMin ?? 0;
    const z = w.focusZone;
    const st = w.sessionType;

    if (z === "Z1" || z === "Z2" || st === undefined || st === "Progression") {
      easyMin += min;
    } else if (
      z === "Z3" ||
      z === "Z4" ||
      st === "Tempo" ||
      st === "Threshold"
    ) {
      moderateMin += min;
    } else if (z === "Z5" || st === "Intervals") {
      hardMin += min;
    } else {
      easyMin += min;
    }
  }

  return {
    easy: Math.round((easyMin / total) * 100),
    moderate: Math.round((moderateMin / total) * 100),
    hard: Math.round((hardMin / total) * 100),
  };
}

/** Ensure total time (runs + ancillaries) fits within the weekly minutes cap by uniformly scaling runs if needed. */
function enforceWeeklyCapOnRuns(
  runs: Workout[],
  ancillariesMin: number,
  weeklyCapMinutes: number
): Workout[] {
  const runTotal = sumMinutes(runs);
  const totalWithAnc = runTotal + ancillariesMin;
  if (totalWithAnc <= weeklyCapMinutes) return runs;

  const allowedForRuns = Math.max(0, weeklyCapMinutes - ancillariesMin);
  if (allowedForRuns <= 0) {
    return runs.map((w) =>
      w.type === "run" ? ({ ...w, durationMin: 0 } as Workout) : w
    );
  }
  const scale = allowedForRuns / Math.max(1, runTotal);
  return runs.map((w) => {
    if (w.type !== "run") return w;
    const d = Math.max(0, Math.round((w.durationMin ?? 0) * scale));
    return { ...w, durationMin: d } as Workout;
  });
}

/** ---------- PREP (partial) week builder ---------- */
function buildPrepWeek(
  startISO: string,
  anchorISO: string,
  input: PlanInput
): Workout[] {
  // Number of days available in prep window
  const days = daysBetween(startISO, anchorISO);
  if (days <= 0) return [];

  const includeMobility = !!input.includeMobility;
  const includeStrength = !!input.includeStrength;

  const mobility: Workout | null = includeMobility
    ? {
        id: uid(),
        type: "mobility",
        date: toStartOfDayISO(startISO),
        durationMin: 20,
        notes: "Mobility 20′: hips/ankles/thoracic. Keep it easy.",
      }
    : null;

  const strength: Workout | null = includeStrength
    ? {
        id: uid(),
        type: "strength",
        date: addDaysISO(startISO, Math.max(0, days - 1)),
        durationMin: 20,
        notes: "Strength 20′: glutes/core. Own the basics.",
      }
    : null;

  // Weekly minutes cap acts as a total cap for this partial period as well.
  // We'll conservatively allow up to 50% of weeklyMinutesMax for a prep window,
  // but also never exceed:
  // - 0 baseline: at most 2 x 10–15′ easy Z2
  // - >0 baseline: at most 50% of currentWeeklyRunningMinutes
  const weeklyCap = clampInt(input.weeklyMinutesMax, 1, 7 * 24 * 60);
  const ancMin = (mobility?.durationMin ?? 0) + (strength?.durationMin ?? 0);
  const leftoverCapForRuns = Math.max(0, Math.floor(weeklyCap * 0.5) - ancMin);

  const baseline = clampInt(input.currentWeeklyRunningMinutes, 0, 7 * 24 * 60);
  let prepRunBudget = 0;
  if (baseline === 0) {
    // True novice: at most 2 short Z2 sessions
    prepRunBudget = Math.min(leftoverCapForRuns, days >= 2 ? 30 : 15); // 2×15′ or 1×15′
  } else {
    // Experienced: at most 50% of baseline, and not beyond leftover cap
    prepRunBudget = Math.min(leftoverCapForRuns, Math.floor(baseline * 0.5));
  }

  if (prepRunBudget <= 0) {
    // Only ancillaries fit
    const out: Workout[] = [];
    if (mobility) out.push(mobility);
    if (strength) out.push(strength);
    return out;
  }

  // Schedule easy Z2 runs on available days within the prep window
  const unavailable = new Set(input.constraints?.daysUnavailable ?? []);
  // Build candidate days from start to (anchor-1)
  const candidates: { dow: number; date: string }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDaysISO(startISO, i);
    const dow = getDow(date);
    if (!unavailable.has(dow)) {
      candidates.push({ dow, date: toStartOfDayISO(date) });
    }
  }
  if (candidates.length === 0) {
    const out: Workout[] = [];
    if (mobility) out.push(mobility);
    if (strength) out.push(strength);
    return out;
  }

  const maxSessions = Math.min(
    candidates.length,
    clampInt(input.runsPerWeek, 1, 7)
  );
  const sessions: string[] = candidates
    .slice(0, maxSessions)
    .map((c) => c.date);

  // Evenly split prepRunBudget across sessions (10–30′ each)
  const each = clampInt(Math.floor(prepRunBudget / sessions.length), 10, 30);
  let remaining = prepRunBudget;

  const runs: Workout[] = [];
  for (let i = 0; i < sessions.length; i++) {
    const give = i === sessions.length - 1 ? Math.max(10, remaining) : each;
    runs.push({
      id: uid(),
      type: "run",
      date: sessions[i],
      durationMin: give,
      role: "Easy",
      focusZone: "Z2",
      notes: "Prep easy Z2: run-walk as needed (RPE 3–4).",
    });
    remaining -= give;
    if (remaining <= 0) break;
  }

  const out: Workout[] = [];
  if (mobility) out.push(mobility);
  out.push(...runs);
  if (strength) out.push(strength);
  return out;
}

/** ---------- FULL week (anchored) builders ---------- */
function buildFullAnchoredWeek(anchorISO: string, input: PlanInput): Workout[] {
  const weeklyCapMinutes = clampInt(input.weeklyMinutesMax, 1, 7 * 24 * 60);
  const includeMobility = !!input.includeMobility;
  const includeStrength = !!input.includeStrength;

  let mobility: Workout | null = includeMobility
    ? {
        id: uid(),
        type: "mobility",
        date: anchorISO,
        durationMin: 20,
        notes: "Mobility 20′: hips/ankles/thoracic. Keep it easy.",
      }
    : null;

  let strength: Workout | null = includeStrength
    ? {
        id: uid(),
        type: "strength",
        date: addDaysISO(anchorISO, 6),
        durationMin: 20,
        notes: "Strength 20′: glutes/core. Own the basics.",
      }
    : null;

  // If the weekly cap is smaller than ancillaries, trim ancillaries to fit.
  let ancillaryTotal =
    (mobility?.durationMin ?? 0) + (strength?.durationMin ?? 0);
  if (weeklyCapMinutes < ancillaryTotal) {
    if (strength) {
      const newStrength = Math.max(
        0,
        weeklyCapMinutes - (mobility?.durationMin ?? 0)
      );
      strength = { ...strength, durationMin: newStrength };
    }
    ancillaryTotal =
      (mobility?.durationMin ?? 0) + (strength?.durationMin ?? 0);
    if (weeklyCapMinutes < ancillaryTotal && mobility) {
      const newMobility = Math.max(
        0,
        weeklyCapMinutes - (strength?.durationMin ?? 0)
      );
      mobility = { ...mobility, durationMin: newMobility };
    }
    ancillaryTotal =
      (mobility?.durationMin ?? 0) + (strength?.durationMin ?? 0);
  }

  const maxRunningGivenCap = Math.max(0, weeklyCapMinutes - ancillaryTotal);
  const declaredRunning = clampInt(
    input.currentWeeklyRunningMinutes,
    0,
    7 * 24 * 60
  );
  const targetRunningMin = Math.min(declaredRunning, maxRunningGivenCap);

  // If no running fits, return ancillaries only
  if (targetRunningMin <= 0) {
    const out: Workout[] = [];
    if (mobility) out.push(mobility);
    if (strength) out.push(strength);
    return out;
  }

  const runsPerWeek = clampInt(input.runsPerWeek, 1, 7);
  const runDays = chooseRunDays(
    runsPerWeek,
    input.constraints?.longRunDay,
    input.constraints?.daysUnavailable
  );

  const qualitySlots = decideQualitySlots(
    input.currentWeeklyRunningMinutes,
    runsPerWeek,
    input.longestRecentRunMinutes
  );

  // Long-run cap relative to RUNNING total
  const longCap = longRunCapForRunningTotal(
    targetRunningMin,
    input.currentWeeklyRunningMinutes,
    input.longestRecentRunMinutes
  );

  // Place long run
  const longDay =
    runDays.find((d) => d === (input.constraints?.longRunDay ?? -1)) ??
    runDays[runDays.length - 1] ??
    (getDow(anchorISO) + 6) % 7; // default last day

  const runs: Workout[] = [];

  // 1) Long run up to cap
  const longRunMin = Math.min(longCap, targetRunningMin);
  if (longRunMin > 0) {
    runs.push({
      id: uid(),
      type: "run",
      date: addDaysISO(anchorISO, (longDay - getDow(anchorISO) + 7) % 7),
      durationMin: longRunMin,
      role: "Long",
      focusZone: "Z2",
      notes:
        "Long Z2: conversational (RPE 3–4). Add 30″ walk breaks if needed.",
    });
  }

  const otherRunDays = runDays.filter((d) => d !== longDay);

  // 2) Quality allocation (only if time left AND days available)
  const remainingAfterLong = Math.max(0, targetRunningMin - longRunMin);
  const qualityDays: number[] = [];
  if (qualitySlots >= 1 && otherRunDays.length > 0 && remainingAfterLong > 0) {
    qualityDays.push(otherRunDays[0]);
  }
  if (qualitySlots >= 2 && otherRunDays.length > 1 && remainingAfterLong > 0) {
    qualityDays.push(otherRunDays[1]);
  }

  let qualityMinutesTotal = 0;
  if (qualityDays.length > 0) {
    const qualityEach =
      remainingAfterLong > 240 ? 50 : remainingAfterLong > 150 ? 45 : 40;
    qualityMinutesTotal = Math.min(
      qualityDays.length * qualityEach,
      remainingAfterLong
    );

    for (let i = 0; i < qualityDays.length; i++) {
      const d = qualityDays[i];
      const isFirst = i === 0;
      const dur = Math.max(
        1,
        Math.round(qualityMinutesTotal / Math.max(1, qualityDays.length))
      );
      if (dur > 0) {
        runs.push({
          id: uid(),
          type: "run",
          date: addDaysISO(anchorISO, (d - getDow(anchorISO) + 7) % 7),
          durationMin: dur,
          role: "Quality",
          focusZone: isFirst ? "Z3" : "Z4",
          sessionType: isFirst ? "Tempo" : "Threshold",
          structure: isFirst
            ? { warm: 10, reps: [{ min: 10, note: "RPE 6" }], cool: 10 }
            : {
                warm: 12,
                reps: [
                  { min: 2, note: "RPE 7" },
                  { min: 2, note: "RPE 7" },
                ],
                cool: 10,
              },
          notes: isFirst
            ? "Tempo (RPE ~6), smooth and controlled."
            : "Controlled repeats (RPE ~7) with full recoveries.",
        });
      }
    }
  }

  // 3) Easy runs: distribute remaining
  const allocatedRunningSoFar = runs.reduce(
    (a, w) => a + (w.durationMin ?? 0),
    0
  );
  let remainingForEasy = Math.max(0, targetRunningMin - allocatedRunningSoFar);
  const easyDays = otherRunDays.filter((d) => !qualityDays.includes(d));
  let iEasy = 0;
  while (remainingForEasy > 0 && iEasy < easyDays.length) {
    const d = easyDays[iEasy++];
    const slotsLeft = easyDays.length - (iEasy - 1);
    const dur = Math.max(1, Math.floor(remainingForEasy / slotsLeft));
    runs.push({
      id: uid(),
      type: "run",
      date: addDaysISO(anchorISO, (d - getDow(anchorISO) + 7) % 7),
      durationMin: dur,
      role: "Easy",
      focusZone: "Z2",
      notes: "Easy Z2: relaxed cadence; finish feeling you could do more.",
    });
    remainingForEasy -= dur;
  }

  // Enforce weekly cap by scaling runs if total (runs + ancillaries) exceeds cap
  const ancMin = (mobility?.durationMin ?? 0) + (strength?.durationMin ?? 0);
  const runsCapped = enforceWeeklyCapOnRuns(runs, ancMin, weeklyCapMinutes);

  const out: Workout[] = [];
  if (mobility) out.push(mobility);
  out.push(...runsCapped);
  if (strength) out.push(strength);

  // Final safety: ensure long run ≤ cap relative to RUNNING total
  const runningTotal = sumMinutes(out.filter((w) => w.type === "run"));
  if (runningTotal > 0) {
    const finalLongCap = longRunCapForRunningTotal(
      runningTotal,
      input.currentWeeklyRunningMinutes,
      input.longestRecentRunMinutes
    );
    const longIdx = out.findIndex((w) => w.type === "run" && w.role === "Long");
    if (longIdx >= 0) {
      const lr = { ...out[longIdx] };
      if (lr.durationMin > finalLongCap) {
        lr.durationMin = finalLongCap;
        out[longIdx] = lr;
      }
    }
  }

  return out;
}

function rampWeekFromBaseline(
  baseWeek: WeekPlan,
  desiredRampPercent: number,
  input: PlanInput
): { workouts: Workout[]; rampPercent: number } {
  const weeklyCapMinutes = clampInt(input.weeklyMinutesMax, 1, 7 * 24 * 60);
  const ancMinBase = sumMinutes(
    baseWeek.workouts.filter((w) => w.type !== "run")
  );
  const baseRunTotal = sumMinutes(
    baseWeek.workouts.filter((w) => w.type === "run")
  );
  const clamp = Math.min(Math.max(0, Math.round(desiredRampPercent)), 8);

  if (baseRunTotal === 0) {
    // Keep flat if no running in base week
    const ancillaries = baseWeek.workouts
      .filter((w) => w.type !== "run")
      .map((w) => ({ ...w, id: uid() }));
    return { workouts: ancillaries, rampPercent: 0 };
  }

  const scale = 1 + clamp / 100;

  // Scale runs only
  let scaledRuns = baseWeek.workouts
    .filter((w) => w.type === "run")
    .map((w) => {
      const d = Math.max(0, Math.round((w.durationMin ?? 0) * scale));
      return { ...w, id: uid(), durationMin: d } as Workout;
    });

  // Re-cap long run after scaling (using RUNNING total)
  const runTotalAfterScale = sumMinutes(scaledRuns);
  const longCap = longRunCapForRunningTotal(
    runTotalAfterScale,
    input.currentWeeklyRunningMinutes,
    input.longestRecentRunMinutes
  );
  const idxLong = scaledRuns.findIndex((w) => w.role === "Long");
  if (idxLong >= 0) {
    const lr = { ...scaledRuns[idxLong] };
    lr.durationMin = Math.min(lr.durationMin, longCap);
    scaledRuns[idxLong] = lr;
  }

  // Enforce weekly cap: runs may need scaling if ancillaries + runs exceed the cap
  scaledRuns = enforceWeeklyCapOnRuns(scaledRuns, ancMinBase, weeklyCapMinutes);

  // Compute achieved ramp vs base
  const newRunTotal = sumMinutes(scaledRuns);
  const achieved = Math.round(
    ((newRunTotal - baseRunTotal) / Math.max(1, baseRunTotal)) * 100
  );

  // Build final week: reuse ancillaries from base
  const ancillaries = baseWeek.workouts
    .filter((w) => w.type !== "run")
    .map((w) => ({ ...w, id: uid() }));
  const all = [...ancillaries, ...scaledRuns];

  return { workouts: all, rampPercent: achieved };
}

/** ---------- main ---------- */
export function generateInitialPlan(
  input: PlanInput & { userId?: string }
): Plan {
  const planId = uid();
  const userId = input.userId ?? "demo-user";

  const anchorDow = Number.isInteger(input.weekAnchorDay)
    ? clampInt(input.weekAnchorDay as number, 0, 6)
    : 1; // default Monday

  const startDate = toStartOfDayISO(input.startDate);
  const firstAnchorStart = nextOnOrAfterDow(startDate, anchorDow);

  const weeks: WeekPlan[] = [];

  // If startDate is before the anchor this week, build a PREP week
  if (firstAnchorStart !== startDate) {
    const prepWorkouts = buildPrepWeek(startDate, firstAnchorStart, input);
    const prepWeek: WeekPlan = {
      weekIndex: 0,
      phase: "prep",
      startDate: startDate, // prep period start (actual chosen date)
      rampPercent: 0,
      intensityMix: computeIntensityMix(prepWorkouts),
      rationale: [
        "Prep period to bridge into your first full training week.",
        "Only easy Z2 sessions; no long run or intensity.",
        "Total time capped by your weekly minutes limit.",
      ],
      workouts: prepWorkouts,
    };
    weeks.push(prepWeek);
  }

  // First FULL anchored week (build)
  const fullWeek0Start = firstAnchorStart;
  const full0Workouts = buildFullAnchoredWeek(fullWeek0Start, input);

  const full0: WeekPlan = {
    weekIndex: weeks.length, // 0 if no prep, else 1
    phase: "build",
    startDate: fullWeek0Start,
    rampPercent: 0,
    intensityMix: computeIntensityMix(full0Workouts),
    rationale: [
      "Baseline equals your current weekly running minutes (capped by minutes limit).",
      "Long run ≤ 35% of running total and ≤ your recent longest (with absolute caps).",
      "Intensity allowed only when frequency, volume, and durability indicate readiness.",
      "Total time (runs + ancillaries) ≤ weekly minutes max.",
    ],
    workouts: full0Workouts,
  };
  weeks.push(full0);

  // Second anchored week (ramp ~7%, ≤8%)
  const { workouts: w1Scaled, rampPercent } = rampWeekFromBaseline(
    full0,
    7,
    input
  );
  const full1Dated = w1Scaled.map((w) => ({
    ...w,
    date: addDaysISO(w.date, 7),
    id: uid(),
  }));
  const full1: WeekPlan = {
    weekIndex: weeks.length, // next index
    phase: "build",
    startDate: addDaysISO(fullWeek0Start, 7),
    rampPercent,
    intensityMix: computeIntensityMix(full1Dated),
    rationale: [
      rampPercent === 0
        ? "Holding steady (no running yet)."
        : "Week-to-week ramp ~7% (clamped at 8%).",
      "Long run re-capped using running total and recent longest.",
      "Total time (runs + ancillaries) held under weekly minutes max.",
    ],
    workouts: full1Dated,
  };
  weeks.push(full1);

  return {
    id: planId,
    userId,
    input,
    weeks,
  };
}
