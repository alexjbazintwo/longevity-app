export function readInitialVertical(): string {
  try {
    if (typeof window !== "undefined" && window.location) {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("v");
      if (q) return q;
    }
  } catch {
    // ignore
  }

  const env = import.meta.env?.VITE_VERTICAL as string | undefined;

  return env || "hybrid";
}
