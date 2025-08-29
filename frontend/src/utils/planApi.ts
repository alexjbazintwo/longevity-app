// src/utils/planApi.ts
import type { Answers } from "@/context/chatWizardContext";

export type Unit = "km" | "mi";

export type Reason = "race" | "time" | "distance" | "health";
export type GoalKind = "race" | "time" | "distance" | "health";

export type DistanceRace = "5k" | "10k" | "half" | "marathon" | "ultra";
export type DistanceJourney = "1k" | "5k" | "10k" | "half" | "marathon";

export type WindowUnit = "weeks" | "months";

export type YesNo = "yes" | "no";

export type PaceUnitSafe = "per_km" | "per_mi";
export type PaceUnitCanonical = "s_per_km" | "s_per_mi";

export type DOW = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type PlanRequestV1 = {
  meta: {
    clientVersion: string;
    utcOffsetMinutes: number;
    previewWeeks: number;
  };
  answers: {
    units: Unit;
    age?: number;
    name?: string;

    reason: Reason;
    goalKind: GoalKind;

    raceDistance?: DistanceRace;
    raceDate?: string;

    windowUnit?: WindowUnit;
    goalHorizonWeeks?: number | string;
    goalHorizonMonths?: number | string;

    hours?: number;
    currentMileage?: number;

    injuries?: string;
    medicalConditions?: string;

    includeStrength?: YesNo;
    includeMobility?: YesNo;

    safeRun?: {
      canRun: boolean;
      distance?: { value: number; unit: Unit };
      pace?: { mmss: string; unit: PaceUnitSafe };
    };
  };
};

export type ZoneBandV1 = {
  label: string;
  hr_pct_low: number;
  hr_pct_high: number;
  hr_bpm_low: number;
  hr_bpm_high: number;
  min_s_per_km: number;
  max_s_per_km: number;
  min_s_per_mi: number;
  max_s_per_mi: number;
  cue: string;
};

export type ZonesV1 = {
  model: string;
  hrmax_estimate: number;
  unitCanonical: PaceUnitCanonical;
  bands: {
    Z1: ZoneBandV1;
    Z2: ZoneBandV1;
    Z3: ZoneBandV1;
    Z4: ZoneBandV1;
    Z5: ZoneBandV1;
  };
};

export type WorkoutRunV1 = {
  id: string;
  kind: "run";
  title: string;
  duration_min?: number;
  primary?: string;
  warmup_min?: number;
  cooldown_min?: number;
  zone?: "Z1" | "Z2" | "Z3" | "Z4" | "Z5";
  pace?: {
    unit: PaceUnitCanonical;
    min: number;
    max: number;
  };
  notes?: string;
  tags?: string[];
};

export type WorkoutStrengthV1 = {
  id: string;
  kind: "strength";
  title: string;
  duration_min?: number;
  notes?: string;
  tags?: string[];
};

export type WorkoutV1 = WorkoutRunV1 | WorkoutStrengthV1;

export type DayV1 = {
  dow: DOW;
  status?: "rest";
  notes?: string;
  workouts: WorkoutV1[];
};

export type WeekV1 = {
  index: number;
  title: string;
  focus?: string;
  volume_km?: number;
  locked: boolean;
  days: DayV1[];
};

export type LocksV1 = {
  totalWeeks: number;
  lockFromWeekIndex: number;
  cta: {
    title: string;
    subTitle: string;
    priceHint?: string;
  };
};

export type NextActionV1 = {
  kind: "primary" | "secondary";
  label: string;
  to: string;
};

export type PlanResponseV1 = {
  generatedAt: string;
  summary: {
    headline: string;
    rationale: string;
  };
  locks: LocksV1;
  zones: ZonesV1;
  weeks: WeekV1[];
  nextActions: NextActionV1[];
};

export function makePlanRequestFrom(
  answers: Answers,
  options?: { previewWeeks?: number; clientVersion?: string }
): PlanRequestV1 {
  const units = (answers.units as Unit) || "km";
  const windowUnit =
    (answers.windowUnit as WindowUnit | undefined) ?? undefined;

  const ageNum = toNumber(answers.age);
  const hoursNum = toNumber(answers.hours);
  const mileageNum = toNumber(answers.currentMileage);

  const injuries = getString(answers.injuries);
  const hasInjury = Boolean(injuries && injuries !== "none");

  const safeDistanceRaw = toNumber(
    (answers as Record<string, unknown>).injurySafeDistanceKm ??
      (answers as Record<string, unknown>).safeDistance
  );
  const safePaceRaw = getString(
    (answers as Record<string, unknown>).injurySafePace as string
  );

  const safeUnit: PaceUnitSafe = units === "km" ? "per_km" : "per_mi";

  const safeRun =
    hasInjury || safeDistanceRaw !== undefined || safePaceRaw
      ? {
          canRun: Boolean(safeDistanceRaw || safePaceRaw),
          distance:
            safeDistanceRaw !== undefined
              ? { value: safeDistanceRaw, unit: units }
              : undefined,
          pace: safePaceRaw ? { mmss: safePaceRaw, unit: safeUnit } : undefined,
        }
      : undefined;

  return {
    meta: {
      clientVersion: options?.clientVersion ?? "web-1.0.0",
      utcOffsetMinutes: -new Date().getTimezoneOffset(),
      previewWeeks: options?.previewWeeks ?? 2,
    },
    answers: {
      units,
      age: ageNum,
      name: getString(answers.name),

      reason: (answers.reason as Reason) ?? "race",
      goalKind: (answers.goalKind as GoalKind) ?? (answers.reason as GoalKind),

      raceDistance: answers.raceDistance as DistanceRace | undefined,
      raceDate: getString(answers.raceDate),

      windowUnit,
      goalHorizonWeeks: getStringOrNumber(answers.goalHorizonWeeks),
      goalHorizonMonths: getStringOrNumber(answers.goalHorizonMonths),

      hours: hoursNum,
      currentMileage: mileageNum,

      injuries,
      medicalConditions: getString(answers.medicalConditions),

      includeStrength:
        (answers.includeStrength as YesNo | undefined) ?? undefined,
      includeMobility:
        (answers.includeMobility as YesNo | undefined) ?? undefined,

      safeRun,
    },
  };
}

export async function requestPlan(
  body: PlanRequestV1,
  options?: { endpoint?: string; signal?: AbortSignal }
): Promise<PlanResponseV1> {
  const params = new URLSearchParams(window.location.search);
  const slow = params.get("slow") === "1";
  const fake =
    import.meta.env.DEV && (params.get("fake") === "1" || !options?.endpoint);

  if (fake) {
    if (slow) await delay(2500);
    return fakePlanResponse(body);
  }

  const endpoint = options?.endpoint ?? "/api/plan/v1";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal,
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Plan API error ${res.status}: ${txt}`);
  }
  const json = (await res.json()) as PlanResponseV1;
  return json;
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return undefined;
}

function getString(v: unknown): string | undefined {
  if (typeof v === "string") {
    const s = v.trim();
    return s === "" ? undefined : s;
  }
  return undefined;
}

function getStringOrNumber(v: unknown): string | number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "") return undefined;
    if (Number.isFinite(Number(s))) return Number(s);
    return s;
  }
  return undefined;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fakePlanResponse(body: PlanRequestV1): PlanResponseV1 {
  const units: Unit = body.answers.units;
  const unitCanonical: PaceUnitCanonical =
    units === "km" ? "s_per_km" : "s_per_mi";

  const age = body.answers.age ?? 35;
  const hrmax = Math.round(208 - 0.7 * age);

  const z = makeZones(hrmax);

  const week1: WeekV1 = {
    index: 0,
    title: "Week 1",
    focus: "Establish routine, protect niggles",
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
              unit: unitCanonical,
              min: units === "km" ? 330 : 531,
              max: units === "km" ? 360 : 579,
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
            title: "Strength — Lower legs",
            duration_min: 30,
            notes: "Eccentric calf raises, single-leg stability.",
            tags: ["strength", "injury-prevention"],
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
              unit: unitCanonical,
              min: units === "km" ? 330 : 531,
              max: units === "km" ? 360 : 579,
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
              unit: unitCanonical,
              min: units === "km" ? 330 : 531,
              max: units === "km" ? 360 : 579,
            },
            notes: "Last 10′ at upper Z2 only if fully pain-free.",
          },
        ],
      },
      { dow: "Sun", workouts: [], status: "rest", notes: "Foam roll calves" },
    ],
  };

  const week2: WeekV1 = {
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
              unit: unitCanonical,
              min: units === "km" ? 330 : 531,
              max: units === "km" ? 360 : 579,
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
              unit: unitCanonical,
              min: units === "km" ? 300 : 483,
              max: units === "km" ? 330 : 531,
            },
            notes: "Stop early if niggle protests.",
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
              unit: unitCanonical,
              min: units === "km" ? 330 : 531,
              max: units === "km" ? 360 : 579,
            },
          },
        ],
      },
      { dow: "Sun", workouts: [], status: "rest" },
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      headline: planHeadline(body),
      rationale:
        "You reported your availability and we’ll bias Z2 aerobic volume, one threshold day, and progressive long runs. Strength focuses on durability; long runs progress cautiously from your current baseline.",
    },
    locks: {
      totalWeeks: totalWeeksFrom(body) ?? 12,
      lockFromWeekIndex: 2,
      cta: {
        title: "Unlock full plan",
        subTitle: "All weeks, calendar export, live pace tuning",
        priceHint: "Free 7-day trial, then £9.99/mo",
      },
    },
    zones: {
      model: "Tanaka_2001",
      hrmax_estimate: hrmax,
      unitCanonical,
      bands: z,
    },
    weeks: [week1, week2],
    nextActions: [
      { kind: "primary", label: "Unlock full plan", to: "/paywall" },
      { kind: "secondary", label: "Personalise further", to: "/setup?edit=1" },
    ],
  };
}

function makeZones(hrmax: number): ZonesV1["bands"] {
  const mk = (
    label: string,
    pctLow: number,
    pctHigh: number,
    kmMin: number,
    kmMax: number,
    miMin: number,
    miMax: number,
    cue: string
  ): ZoneBandV1 => ({
    label,
    hr_pct_low: pctLow,
    hr_pct_high: pctHigh,
    hr_bpm_low: Math.round((pctLow / 100) * hrmax),
    hr_bpm_high: Math.round((pctHigh / 100) * hrmax),
    min_s_per_km: kmMin,
    max_s_per_km: kmMax,
    min_s_per_mi: miMin,
    max_s_per_mi: miMax,
    cue,
  });

  return {
    Z1: mk(
      "Very Easy / Recovery",
      55,
      72,
      360,
      405,
      579,
      652,
      "Conversational, legs feel fresh."
    ),
    Z2: mk(
      "Easy / Aerobic Base",
      72,
      82,
      330,
      360,
      531,
      579,
      "Steady, controlled breathing."
    ),
    Z3: mk(
      "Tempo / Threshold-",
      82,
      87,
      300,
      330,
      483,
      531,
      "Comfortably hard; short phrases only."
    ),
    Z4: mk(
      "Threshold",
      87,
      92,
      285,
      300,
      459,
      483,
      "Near-LT; focused breathing."
    ),
    Z5: mk(
      "VO₂ / Very Hard",
      92,
      100,
      250,
      285,
      402,
      459,
      "Short reps; full recovery."
    ),
  };
}

function totalWeeksFrom(body: PlanRequestV1): number | undefined {
  if (body.answers.windowUnit === "weeks") {
    const n = Number(body.answers.goalHorizonWeeks);
    if (Number.isFinite(n)) return n;
  }
  if (body.answers.windowUnit === "months") {
    const m = Number(body.answers.goalHorizonMonths);
    if (Number.isFinite(m)) return m * 4;
  }
  return undefined;
}

function planHeadline(body: PlanRequestV1): string {
  const dist =
    (body.answers.raceDistance as string | undefined) ??
    (body.answers.reason === "distance"
      ? (body.answers.raceDistance as string | undefined)
      : undefined);
  const weeks = totalWeeksFrom(body);
  const partA = weeks ? `${weeks}-week` : "Adaptive";
  const partB = dist ? ` ${titleCase(dist)} ` : " ";
  return `${partA}${partB}Plan — preview`;
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
