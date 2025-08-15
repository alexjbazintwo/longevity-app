// src/types/onboarding.ts

export type Goal =
  | "all_round" // Elite Stack (Everything)
  | "longevity_first" // Built to Last (recovery-first)
  | "look_perform" // Sculpt & Perform (aesthetics + performance)
  | "cardio_engine"; // Cardiometabolic Health (keep key for compatibility)

export type Experience = "beginner" | "intermediate" | "advanced";
export type DurationPreference = "short" | "balanced" | "long";
export type SessionLength = "20" | "30" | "45" | "60"; // legacy for migration
export type Equipment = "none" | "minimal" | "full_gym";
export type TimeOfDay = "morning" | "evening" | "varies";
export type Location = "home" | "gym" | "outdoors" | "mix";
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type Emphasis =
  | "strength"
  | "zone2"
  | "hiit"
  | "mobility"
  | "sleep"
  | "nutrition"
  | "fat_loss"; // NEW

export type CommonInjury =
  | "shoulder"
  | "knee"
  | "lower_back"
  | "elbow"
  | "ankle"
  | "hip"
  | "neck";

export type OnboardingState = {
  goal: Goal | null;
  experience: Experience | null;

  // Constraints
  workoutsPerWeek: number | null;
  hoursPerWeek: number | null;
  durationPreference: DurationPreference | null;

  // Environment
  equipment: Equipment | null;
  injuries: string; // free text
  commonInjuries: CommonInjury[]; // quick chips

  // Preferences
  timeOfDay: TimeOfDay | null;
  location: Location | null;
  daysOfWeek: DayOfWeek[];

  // Personal emphasis
  emphasis: Emphasis[];
};
