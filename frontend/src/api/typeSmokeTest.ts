import type { PlanInput } from "@shared/types/planning";

export function _toPlanInputSmokeTest(): PlanInput {
  return {
    goal: "Half",
    startDate: new Date().toISOString(),
    weeklyHoursMin: 3,
    weeklyHoursMax: 4,
    runsPerWeek: 4,
  };
}
