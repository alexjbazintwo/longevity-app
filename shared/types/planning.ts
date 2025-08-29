export type Goal = "5k" | "10k" | "Half" | "Marathon" | "Base" | "ReturnToRun";

export interface PlanInput {
  goal: Goal;
  targetDate?: string;
  startDate: string;

  currentWeeklyRunningMinutes: number;
  longestRecentRunMinutes: number;

  weeklyMinutesMax: number;
  runsPerWeek: number;

  includeMobility: boolean;
  includeStrength: boolean;

  constraints?: { daysUnavailable?: number[]; longRunDay?: number };
  weekAnchorDay?: number; // 0=Sun .. 6=Sat (backend defaults to Monday if omitted)

  injuries?: string[];
  medicalFlags?: string[];
}

export type WorkoutType = "run" | "mobility" | "strength";

export interface Workout {
  id: string;
  type: WorkoutType;
  date: string; // ISO datetime
  durationMin: number;
  role?: "Easy" | "Long" | "Quality";
  focusZone?: "Z1" | "Z2" | "Z3" | "Z4" | "Z5";
  sessionType?: "Tempo" | "Threshold" | "Intervals" | "Progression";
  structure?: unknown;
  notes?: string;
}

export interface WeekPlan {
  weekIndex: number; // 0 = first item returned
  phase: "prep" | "build" | "recovery";
  startDate: string; // ISO, start of this user's anchored week
  rampPercent: number; // ≤ 8%
  intensityMix: { easy: number; moderate: number; hard: number };
  workouts: Workout[];
  rationale?: string[];
}

export interface Plan {
  id: string;
  userId: string;
  input: PlanInput;
  weeks: WeekPlan[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  date: string;
  type: WorkoutType;
  durationMin: number;
  distanceKm?: number;
  rpe?: number;
  avgHr?: number;
  notes?: string;
  source: "manual" | "strava" | "csv";
}

export interface ReplanRequest {
  planId: string;
  weekIndex: number;
}

export interface ReplanDiff {
  before: WeekPlan;
  after: WeekPlan;
  reasons: string[];
}
