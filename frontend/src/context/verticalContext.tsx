import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getPack } from "@/verticals";
import type { ExtendedVerticalPack } from "@/types/vertical";

type VerticalKey = "running";

type VerticalContextValue = {
  pack: ExtendedVerticalPack;
  setVertical: (key: VerticalKey) => void;
};

const VerticalContext = createContext<VerticalContextValue | undefined>(
  undefined
);

export function VerticalProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<VerticalKey>("running");
  const pack = useMemo(() => getPack(key), [key]);

  useEffect(() => {
    const root = document.documentElement;

    if (!root.classList.contains("dark")) {
      root.classList.add("dark");
    }

    Array.from(root.classList)
      .filter((c) => c.startsWith("theme-"))
      .forEach((c) => root.classList.remove(c));

    if (pack.themeClass) {
      root.classList.add(pack.themeClass);
    }
  }, [pack.themeClass]);

  const value = useMemo<VerticalContextValue>(
    () => ({
      pack,
      setVertical: (k: VerticalKey) => setKey(k),
    }),
    [pack]
  );

  return (
    <VerticalContext.Provider value={value}>
      {children}
    </VerticalContext.Provider>
  );
}

export function useVertical(): VerticalContextValue {
  const ctx = useContext(VerticalContext);
  if (!ctx) throw new Error("useVertical must be used within VerticalProvider");
  return ctx;
}
