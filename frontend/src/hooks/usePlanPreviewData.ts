// src/hooks/usePlanPreviewData.ts
import { useEffect, useState } from "react";

type UsePlanPreviewDataResult = {
  isLoading: boolean;
  error: string | null;
};

/**
 * Simulates fetching/building the plan data.
 * Add ?slow=1 to the URL to force a 5s delay (for dev/demo).
 */
export function usePlanPreviewData(): UsePlanPreviewDataResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSlow = params.get("slow") === "1";
    const delayMs = isSlow ? 5000 : 0;

    let cancelled = false;
    const id = window.setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
        setError(null);
      }
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  return { isLoading, error };
}

export default usePlanPreviewData;
