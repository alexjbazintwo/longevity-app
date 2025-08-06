import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface LongevityChartProps {
  currentAge: number;
  predictedLifeExpectancy: number;
  averageLifeExpectancyInCountry: number;
  percentageChanceOfReaching100: number;
  predictedLastHealthyAge: number;
}

function generateLifespanData(
  currentAge: number,
  predictedLifeExpectancy: number,
  chanceAt100: number
) {
  const data = [];
  for (let age = currentAge; age <= 100; age++) {
    let chance: number;

    if (age <= predictedLifeExpectancy) {
      const progress =
        (age - currentAge) / (predictedLifeExpectancy - currentAge);
      chance = 100 - progress * 50;
    } else {
      const progress =
        (age - predictedLifeExpectancy) / (100 - predictedLifeExpectancy);
      chance = 50 - progress * (50 - chanceAt100);
    }

    data.push({ age, chance: parseFloat(chance.toFixed(2)) });
  }

  return data;
}

export default function LongevityChart({
  currentAge,
  predictedLifeExpectancy,
  averageLifeExpectancyInCountry,
  percentageChanceOfReaching100,
  predictedLastHealthyAge,
}: LongevityChartProps) {
  const data = generateLifespanData(
    currentAge,
    predictedLifeExpectancy,
    percentageChanceOfReaching100
  );

  const referencePoints = [
    {
      x: averageLifeExpectancyInCountry,
      color: "#6b7280",
    },
    {
      x: predictedLastHealthyAge,
      color: "#10b981",
    },
    {
      x: predictedLifeExpectancy,
      color: "#3b82f6",
    },
    {
      x: 100,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="my-16 max-w-6xl mx-auto px-6 font-figtree">
      <h3 className="text-4xl sm:text-5xl font-bold text-center text-gray-800 mb-10 tracking-tight">
        Your Longevity Journey
      </h3>

      <div className="rounded-[2rem] bg-white/50 shadow-2xl backdrop-blur-lg border border-gray-200 p-6 sm:p-12 relative overflow-hidden transition-all">
        <ResponsiveContainer width="100%" height={420}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="lifeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="3"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

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

            <Area
              type="monotone"
              dataKey="chance"
              stroke="#3b82f6"
              fill="url(#lifeGradient)"
              strokeWidth={3}
              dot={false}
              animationDuration={1600}
              filter="url(#glow)"
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

        {/* Modern Legend */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-sm text-gray-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-md" />
            <span>Your Life Expectancy</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-md" />
            <span>Last Healthy Age</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#6b7280] shadow-md" />
            <span>National Average</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-md" />
            <span>
              {percentageChanceOfReaching100}% chance of reaching age 100
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Hover to see your estimated chance of reaching each age, based on your
        lifestyle and habits.
      </p>
    </div>
  );
}
