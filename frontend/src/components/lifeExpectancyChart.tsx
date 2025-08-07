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
  currentSurvivalTrajectory,
  potentialSurvivalTrajectory,
}: LongevityChartProps) {
  const data: {
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
      data.push({
        age,
        current: current?.chance,
        potential: potential?.chance,
      });
    });

  const findAgeAt50 = (trajectory: LongevitySurvivalPoint[]) =>
    trajectory.find((point) => point.chance === 50)?.age ?? null;

  const currentLEAge = findAgeAt50(currentSurvivalTrajectory);
  const potentialLEAge = findAgeAt50(potentialSurvivalTrajectory);

  return (
    <div className="mt-16 max-w-6xl mx-auto px-6 font-figtree">
      <h3 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4 tracking-tight">
        Life Expectancy Chart
      </h3>
      <p className="text-center text-gray-600 text-sm mb-10 max-w-2xl mx-auto">
        Comparison of current life expectancy and potential life expectancy with
        improved lifestyle
      </p>

      <div className="rounded-[2rem] bg-white/50 shadow-2xl backdrop-blur-lg border border-gray-200 p-6 sm:p-12 relative overflow-hidden transition-all">
        <ResponsiveContainer width="100%" height={420}>
          <AreaChart data={data}>
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
              connectNulls={true}
              name="Current Life Expectancy Trajectory"
            />
            <Line
              type="monotone"
              dataKey="potential"
              stroke="#22c55e"
              strokeWidth={3}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={true}
              name="Potential Life Expectancy Trajectory"
            />

            {currentLEAge && (
              <ReferenceLine
                x={currentLEAge}
                stroke="#3b82f6"
                strokeDasharray="4 2"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            )}
            {potentialLEAge && (
              <ReferenceLine
                x={potentialLEAge}
                stroke="#22c55e"
                strokeDasharray="4 2"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm text-gray-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-[#3b82f6]" />
            <span>Current Life Expectancy Trajectory</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-[#22c55e]" />
            <span>Potential Life Expectancy Trajectory</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-4 h-0.5 border-t-2 border-dashed"
              style={{ borderColor: "#3b82f6" }}
            />
            <span>Estimated Life Expectancy</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-4 h-0.5 border-t-2 border-dashed"
              style={{ borderColor: "#22c55e" }}
            />
            <span>Estimated Potential Life Expectancy</span>
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
