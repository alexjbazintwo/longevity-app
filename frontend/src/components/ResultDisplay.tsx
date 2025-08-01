// src/components/ResultDisplay.tsx
type Props = {
  result: string | null;
};

export default function ResultDisplay({ result }: Props) {
  if (!result) return null;

  return (
    <div className="mt-10 bg-green-50 p-6 rounded shadow text-gray-800">
      <h3 className="text-xl font-semibold mb-2">Prediction Result</h3>
      <p className="whitespace-pre-wrap">{result}</p>
    </div>
  );
}
