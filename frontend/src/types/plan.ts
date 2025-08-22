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

export type WorkoutMobilityV1 = {
  id: string;
  kind: "mobility";
  title: string;
  duration_min?: number;
  notes?: string;
  tags?: string[];
};

export type WorkoutCrossV1 = {
  id: string;
  kind: "cross";
  title: string;
  duration_min?: number;
  zone?: "Z1" | "Z2" | "Z3";
  rpe?: number;
  notes?: string;
  tags?: string[];
};

export type WorkoutRehabV1 = {
  id: string;
  kind: "rehab";
  title: string;
  duration_min?: number;
  primary?: string;
  notes?: string;
  tags?: string[];
};

export type WorkoutV1 =
  | WorkoutRunV1
  | WorkoutStrengthV1
  | WorkoutMobilityV1
  | WorkoutCrossV1
  | WorkoutRehabV1;

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
