/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import type { LongevityPredictionResponse } from "../types/longevity/longevityResult";

type StoredResult = LongevityPredictionResponse & { dob: string };

interface ResultContextType {
  result: StoredResult | null;
  setResult: (data: StoredResult) => void;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

const STORAGE_KEY = "longevityResult";

export function ResultProvider({ children }: { children: ReactNode }) {
  const [result, setResultState] = useState<StoredResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setResultState(JSON.parse(stored));
      } catch {
        console.error("Failed to parse stored longevity result.");
      }
    }
  }, []);

  const setResult = (data: StoredResult) => {
    setResultState(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const value = useMemo(() => ({ result, setResult }), [result]);

  return (
    <ResultContext.Provider value={value}>{children}</ResultContext.Provider>
  );
}

export function useResultContext(): ResultContextType {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResultContext must be used within a ResultProvider");
  }
  return context;
}
