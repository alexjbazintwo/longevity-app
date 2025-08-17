import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getPack } from "@/verticals";
import {
  VerticalContext,
  type VerticalKey,
  type VerticalContextValue,
} from "./verticalContext.shared";

export default function VerticalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [key, setKey] = useState<VerticalKey>("running");
  const pack = useMemo(() => getPack(key), [key]);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("dark")) root.classList.add("dark");
    Array.from(root.classList)
      .filter((c) => c.startsWith("theme-"))
      .forEach((c) => root.classList.remove(c));
    if (pack.themeClass) root.classList.add(pack.themeClass);
  }, [pack.themeClass]);

  const value: VerticalContextValue = useMemo(
    () => ({
      pack,
      setVertical: (k) => setKey(k),
    }),
    [pack]
  );

  return (
    <VerticalContext.Provider value={value}>
      {children}
    </VerticalContext.Provider>
  );
}
