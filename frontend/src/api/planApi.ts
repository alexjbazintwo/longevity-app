// src/api/planApi.ts
import type {
  Unit,
  Reason,
  GoalKind,
  DistanceRace,
  WindowUnit,
  YesNo,
  PaceUnitSafe,
  PlanRequestV1,
  ZoneBandV1,
  ZonesV1,
  WeekV1,
  PlanResponseV1,
} from "@/types/plan";

/* ---------- Local answers -> request ---------- */

function readAnswers(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem("wiz_answers");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object")
      return parsed as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}

function pickUnit(v: unknown): Unit {
  return v === "mi" ? "mi" : "km";
}

function pickYesNo(v: unknown): YesNo | undefined {
  if (v === "yes" || v === "no") return v;
  return undefined;
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function buildRequestFromLocalStorage(previewWeeks = 2): PlanRequestV1 {
  const a = readAnswers();

  const units = pickUnit(a["units"]);
  const age = toNumber(a["age"]);
  const name = typeof a["name"] === "string" ? a["name"] : undefined;

  const reasonRaw = typeof a["reason"] === "string" ? a["reason"] : "race";
  const goalKindRaw =
    typeof a["goalKind"] === "string" ? a["goalKind"] : reasonRaw;
  const reason: Reason =
    reasonRaw === "time" || reasonRaw === "distance" || reasonRaw === "health"
      ? reasonRaw
      : "race";
  const goalKind: GoalKind =
    goalKindRaw === "time" ||
    goalKindRaw === "distance" ||
    goalKindRaw === "health"
      ? goalKindRaw
      : "race";

  const raceDistance = ((): DistanceRace | undefined => {
    const r = a["raceDistance"];
    if (
      r === "5k" ||
      r === "10k" ||
      r === "half" ||
      r === "marathon" ||
      r === "ultra"
    )
      return r;
    return undefined;
  })();

  const raceDate =
    typeof a["raceDate"] === "string" ? a["raceDate"] : undefined;

  const windowUnit = ((): WindowUnit | undefined => {
    if (a["windowUnit"] === "weeks" || a["windowUnit"] === "months")
      return a["windowUnit"];
    return undefined;
  })();

  const goalHorizonWeeks = toNumber(a["goalHorizonWeeks"]);
  const goalHorizonMonths = toNumber(a["goalHorizonMonths"]);

  const hours = toNumber(a["hours"]);
  const currentMileage = toNumber(a["currentMileage"]);

  const injuries =
    typeof a["injuries"] === "string" ? a["injuries"] : undefined;
  const medicalConditions =
    typeof a["medicalConditions"] === "string"
      ? a["medicalConditions"]
      : undefined;

  const includeStrength = pickYesNo(a["includeStrength"]);
  const includeMobility = pickYesNo(a["includeMobility"]);

  const safeDistanceNum =
    toNumber(a["safeDistance"]) ??
    toNumber(a["safeDistanceKm"]) ??
    toNumber(a["injurySafeDistanceKm"]);
  const safePaceStr =
    (typeof a["safePace"] === "string" && a["safePace"]) ||
    (typeof a["safePaceMMSS"] === "string" && a["safePaceMMSS"]) ||
    (typeof a["injurySafePace"] === "string" && a["injurySafePace"]) ||
    undefined;

  const safeRun: PlanRequestV1["answers"]["safeRun"] | undefined =
    safeDistanceNum || safePaceStr
      ? {
          canRun: true,
          distance: safeDistanceNum
            ? { value: safeDistanceNum, unit: units }
            : undefined,
          pace: safePaceStr
            ? {
                mmss: safePaceStr,
                unit:
                  units === "km"
                    ? ("per_km" as PaceUnitSafe)
                    : ("per_mi" as PaceUnitSafe),
              }
            : undefined,
        }
      : undefined;

  return {
    meta: {
      clientVersion: "web-1.0.0",
      utcOffsetMinutes: -new Date().getTimezoneOffset(),
      previewWeeks,
    },
    answers: {
      units,
      age,
      name,
      reason,
      goalKind,
      raceDistance,
      raceDate,
      windowUnit,
      goalHorizonWeeks,
      goalHorizonMonths,
      hours,
      currentMileage,
      injuries,
      medicalConditions,
      includeStrength,
      includeMobility,
      safeRun,
    },
  };
}

/* ---------- Fake plan generator (for demo) ---------- */

function hrMaxTanaka(age?: number): number {
  if (!age || age <= 0 || age > 100) return 190;
  return Math.round(208 - 0.7 * age);
}

function zoneBands(hrMax: number): ZonesV1["bands"] {
  const mk = (
    pctLow: number,
    pctHigh: number,
    kmMin: number,
    kmMax: number,
    label: string,
    cue: string
  ): ZoneBandV1 => ({
    label,
    hr_pct_low: pctLow,
    hr_pct_high: pctHigh,
    hr_bpm_low: Math.round((pctLow / 100) * hrMax),
    hr_bpm_high: Math.round((pctHigh / 100) * hrMax),
    min_s_per_km: kmMin,
    max_s_per_km: kmMax,
    min_s_per_mi: Math.round(kmMin * 1.609344),
    max_s_per_mi: Math.round(kmMax * 1.609344),
    cue,
  });

  return {
    Z1: mk(
      55,
      72,
      360,
      405,
      "Very Easy / Recovery",
      "All-day jog, conversational, legs fresh."
    ),
    Z2: mk(
      72,
      82,
      330,
      360,
      "Easy / Aerobic Base",
      "Steady, smooth breathing; build volume."
    ),
    Z3: mk(
      82,
      87,
      300,
      330,
      "Tempo / Threshold-",
      "Comfortably hard; short phrases only."
    ),
    Z4: mk(87, 92, 285, 300, "Threshold", "Near LT; strong but sustainable."),
    Z5: mk(
      92,
      100,
      250,
      285,
      "VO₂ / Very Hard",
      "Short reps with full recoveries."
    ),
  };
}

function fakePlanFrom(req: PlanRequestV1): PlanResponseV1 {
  const nowIso = new Date().toISOString();
  const hrmax = hrMaxTanaka(req.answers.age);
  const zones: ZonesV1 = {
    model: "Tanaka_2001",
    hrmax_estimate: hrmax,
    unitCanonical: "s_per_km",
    bands: zoneBands(hrmax),
  };

  const w1: WeekV1 = {
    index: 0,
    title: "Week 1",
    focus: req.answers.injuries
      ? "Establish routine, protect niggles"
      : "Aerobic base + light strides",
    volume_km: 34,
    locked: false,
    days: [
      { dow: "Mon", workouts: [], status: "rest", notes: "Optional mobility" },
      {
        dow: "Tue",
        workouts: [
          {
            id: "w1d2-easy40",
            kind: "run",
            title: "Easy Run",
            duration_min: 40,
            zone: "Z2",
            pace: {
              unit: "s_per_km",
              min: zones.bands.Z2.min_s_per_km,
              max: zones.bands.Z2.max_s_per_km,
            },
            notes: "Keep it smooth; absolutely pain-free.",
            tags: ["easy", "base"],
          },
        ],
      },
      {
        dow: "Wed",
        workouts: [
          {
            id: "w1d3-strength30",
            kind: "strength",
            title: "Strength — Lower body",
            duration_min: 30,
            notes: "Eccentric calf raises, single-leg stability.",
            tags: ["strength", "durability"],
          },
        ],
      },
      { dow: "Thu", workouts: [], status: "rest" },
      {
        dow: "Fri",
        workouts: [
          {
            id: "w1d5-easy30",
            kind: "run",
            title: "Easy Run",
            duration_min: 30,
            zone: "Z2",
            pace: {
              unit: "s_per_km",
              min: zones.bands.Z2.min_s_per_km,
              max: zones.bands.Z2.max_s_per_km,
            },
            notes: "Check-in: 0/10 pain during and after.",
          },
        ],
      },
      {
        dow: "Sat",
        workouts: [
          {
            id: "w1d6-long75",
            kind: "run",
            title: "Long Run — 75 min",
            duration_min: 75,
            zone: "Z2",
            pace: {
              unit: "s_per_km",
              min: zones.bands.Z2.min_s_per_km,
              max: zones.bands.Z2.max_s_per_km,
            },
            notes: "Last 10′ at upper Z2 only if fully pain-free.",
          },
        ],
      },
      { dow: "Sun", workouts: [], status: "rest", notes: "Foam roll calves" },
    ],
  };

  const w2: WeekV1 = {
    index: 1,
    title: "Week 2",
    focus: "Repeatable structure + slight volume bump",
    volume_km: 36,
    locked: false,
    days: [
      { dow: "Mon", workouts: [], status: "rest" },
      {
        dow: "Tue",
        workouts: [
          {
            id: "w2d2-easy45",
            kind: "run",
            title: "Easy Run",
            duration_min: 45,
            zone: "Z2",
            pace: {
              unit: "s_per_km",
              min: zones.bands.Z2.min_s_per_km,
              max: zones.bands.Z2.max_s_per_km,
            },
          },
        ],
      },
      {
        dow: "Wed",
        workouts: [
          {
            id: "w2d3-tempo3x8",
            kind: "run",
            title: "Tempo — 3×8 min",
            primary: "3×8′ @ Z3 with 3′ jog",
            warmup_min: 15,
            cooldown_min: 10,
            zone: "Z3",
            pace: {
              unit: "s_per_km",
              min: zones.bands.Z3.min_s_per_km,
              max: zones.bands.Z3.max_s_per_km,
            },
            notes: "Stop early if anything flares up.",
          },
        ],
      },
      {
        dow: "Thu",
        workouts: [
          {
            id: "w2d4-strength35",
            kind: "strength",
            title: "Strength — Lower body",
            duration_min: 35,
          },
        ],
      },
      { dow: "Fri", workouts: [], status: "rest", notes: "Optional 20′ walk" },
      {
        dow: "Sat",
        workouts: [
          {
            id: "w2d6-long85",
            kind: "run",
            title: "Long Run — 85 min",
            duration_min: 85,
            zone: "Z2",
            pace: {
              unit: "s_per_km",
              min: zones.bands.Z2.min_s_per_km,
              max: zones.bands.Z2.max_s_per_km,
            },
          },
        ],
      },
      { dow: "Sun", workouts: [], status: "rest" },
    ],
  };

  const headline =
    req.answers.goalKind === "race" && req.answers.raceDistance
      ? `Adaptive ${req.answers.raceDistance.toUpperCase()} plan — preview`
      : "Adaptive running plan — preview";

  const rationaleParts: string[] = [];
  if (typeof req.answers.hours === "number")
    rationaleParts.push(`~${req.answers.hours}h/week available`);
  if (req.answers.injuries) rationaleParts.push("niggle-aware progression");
  rationaleParts.push("focus on Z2 base with one threshold support");
  const rationale = `Based on your setup (${rationaleParts.join(
    ", "
  )}). We bias aerobic volume, include strength for durability, and progress long runs cautiously from your current baseline.`;

  return {
    generatedAt: nowIso,
    summary: {
      headline,
      rationale,
    },
    locks: {
      totalWeeks:
        (typeof req.answers.goalHorizonWeeks === "number" &&
          req.answers.goalHorizonWeeks) ||
        12,
      lockFromWeekIndex: 2,
      cta: {
        title: "Unlock full plan",
        subTitle: "All weeks, calendar export, live pace tuning",
        priceHint: "Free 7-day trial, then £9.99/mo",
      },
    },
    zones,
    weeks: [w1, w2],
    nextActions: [
      { kind: "primary", label: "Unlock full plan", to: "/paywall" },
      { kind: "secondary", label: "Personalise further", to: "/setup?edit=1" },
    ],
  };
}

/* ---------- Public API ---------- */

export async function getPlanPreview(opts?: {
  demo?: boolean;
}): Promise<PlanResponseV1> {
  const useDemo = opts?.demo === true;

  if (!useDemo) {
    const apiBase = import.meta.env.VITE_API_BASE as string | undefined;
    if (apiBase) {
      const req = buildRequestFromLocalStorage(2);
      try {
        const res = await fetch(`${apiBase.replace(/\/+$/, "")}/plan/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        if (res.ok) {
          const json = (await res.json()) as PlanResponseV1;
          return json;
        }
      } catch {
        /* fall back to demo */
      }
    }
  }

  const req = buildRequestFromLocalStorage(2);
  return fakePlanFrom(req);
}
