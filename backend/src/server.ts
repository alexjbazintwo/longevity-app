import type { PlanInput } from "@shared/types/planning";

const _demo: PlanInput = {
  goal: "10k",
  startDate: new Date().toISOString(),
  weeklyHoursMin: 3,
  weeklyHoursMax: 5,
  runsPerWeek: 4,
  constraints: { longRunDay: 6 },
};
void _demo; // silence unused var

import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
