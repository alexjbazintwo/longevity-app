interface LongevityChartProps {
  currentAge: number;
  predictedLifeExpectancy: number;
  averageLifeExpectancyInCountry: number;
  percentageChanceOfReaching100: number;
}

export default function LongevityChart({
  currentAge,
  predictedLifeExpectancy,
  averageLifeExpectancyInCountry,
  percentageChanceOfReaching100,
}: LongevityChartProps) {
  const maxAge = 100;
  const width = 728;
  const height = 60;

  const startX = (currentAge / maxAge) * width;
  const rawBarLength =
    ((predictedLifeExpectancy - currentAge) / maxAge) * width;
  const barLength = Math.max(0, rawBarLength);

  return (
    <div className="my-12 text-center font-figtree">
      <h3 className="text-2xl font-semibold mb-6">Longevity Overview</h3>

      <svg width={width} height={height}>
        <defs>
          <linearGradient id="life-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        <rect
          x={startX}
          y={0}
          width={barLength}
          height={height}
          rx={height / 2}
          ry={height / 2}
          fill="url(#life-gradient)"
        />
      </svg>

      <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-[728px] mx-auto">
        <span>Age {currentAge}</span>
        <span>Age 100</span>
      </div>

      <div className="mt-6 text-gray-700">
        <p>
          <strong>Predicted life expectancy:</strong> {predictedLifeExpectancy}{" "}
          years
        </p>
        <p>
          <strong>National average:</strong> {averageLifeExpectancyInCountry}{" "}
          years
        </p>
        <p>
          <strong>Chance of reaching 100:</strong>{" "}
          {percentageChanceOfReaching100}%
        </p>
      </div>
    </div>
  );
}
