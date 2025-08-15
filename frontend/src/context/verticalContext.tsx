/* eslint react-refresh/only-export-components: ["warn", { "allowExportNames": ["useVertical"] }] */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { VerticalPack } from "@/types/vertical";
import { getPack } from "@/verticals";
import { readInitialVertical } from "@/context/vertical.helpers";

type VerticalContextValue = {
  pack: VerticalPack;
  setVertical: (slug: string) => void;
};

const VerticalContext = createContext<VerticalContextValue | undefined>(
  undefined
);

export function VerticalProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string>(readInitialVertical);
  const pack = useMemo(() => getPack(slug), [slug]);

  useEffect(() => {
    const cls = pack.themeClass || "";
    document.body.classList.add(cls);
    return () => {
      document.body.classList.remove(cls);
    };
  }, [pack.themeClass]);

  const value = useMemo<VerticalContextValue>(
    () => ({ pack, setVertical: setSlug }),
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
