import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Line,
} from "recharts";
import type { LongevitySurvivalPoint } from "../types/longevityResult";

interface LongevityChartProps {
  currentAge: number;
  predictedLifeExpectancy: number;
  potentialLifeExpectancy: number;
  currentChanceAt100: number;
  potentialChanceAt100: number;
  currentSurvivalTrajectory: LongevitySurvivalPoint[];
  potentialSurvivalTrajectory: LongevitySurvivalPoint[];
}

export default function LifeExpectancyChart({
  predictedLifeExpectancy,
  potentialLifeExpectancy,
  currentSurvivalTrajectory,
  potentialSurvivalTrajectory,
}: LongevityChartProps) {
  const mergedTrajectory: {
    age: number;
    current?: number;
    potential?: number;
  }[] = [];

  const ageSet = new Set([
    ...currentSurvivalTrajectory.map((p) => p.age),
    ...potentialSurvivalTrajectory.map((p) => p.age),
  ]);

  Array.from(ageSet)
    .sort((a, b) => a - b)
    .forEach((age) => {
      const current = currentSurvivalTrajectory.find((p) => p.age === age);
      const potential = potentialSurvivalTrajectory.find((p) => p.age === age);
      mergedTrajectory.push({
        age,
        current: current?.chance,
        potential: potential?.chance,
      });
    });

  const referencePoints = [
    {
      x: Math.min(predictedLifeExpectancy, 100),
      color: "#3b82f6",
      label: "Your Life Expectancy",
    },
    {
      x: Math.min(potentialLifeExpectancy, 100),
      color: "#22c55e",
      label: "Potential Life Expectancy",
    },
  ];

  return (
    <div className="my-16 max-w-6xl mx-auto px-6 font-figtree">
      <h3 className="text-4xl sm:text-5xl font-bold text-center text-gray-800 mb-10 tracking-tight">
        Your Longevity Journey
      </h3>

      <div className="rounded-[2rem] bg-white/50 shadow-2xl backdrop-blur-lg border border-gray-200 p-6 sm:p-12 relative overflow-hidden transition-all">
        <ResponsiveContainer width="100%" height={420}>
          <AreaChart data={mergedTrajectory}>
            <XAxis
              dataKey="age"
              stroke="#9ca3af"
              tick={{ fontSize: 13, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              stroke="#9ca3af"
              tick={{ fontSize: 13, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}% chance`}
              labelFormatter={(label: number) => `Age ${label}`}
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                padding: "10px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                backdropFilter: "blur(6px)",
              }}
              wrapperStyle={{ outline: "none" }}
            />

            <Line
              type="monotone"
              dataKey="current"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="Current Trajectory"
            />
            <Line
              type="monotone"
              dataKey="potential"
              stroke="#22c55e"
              strokeWidth={3}
              strokeDasharray="6 3"
              dot={false}
              name="Potential Trajectory"
            />

            {referencePoints.map(({ x, color }, i) => (
              <ReferenceLine
                key={`line-${i}`}
                x={x}
                stroke={color}
                strokeDasharray="4 2"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <span>Current Life Expectancy</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span>Potential Life Expectancy</span>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Hover to compare your current and potential survival chances at every
        age.
      </p>
    </div>
  );
}
