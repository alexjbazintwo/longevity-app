import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Live Longer, Healthier, Better
      </h2>
      <p className="text-lg text-gray-600 max-w-xl">
        Discover how your current lifestyle could affect your lifespan – and
        what you can do to extend it.
      </p>
      <Link to="/life-expectancy">
        <button className="mt-6 px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 transition">
          Check Your Life Expectancy →
        </button>
      </Link>
    </main>
  );
}
