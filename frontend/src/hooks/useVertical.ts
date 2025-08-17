// src/hooks/useVertical.ts
import { useContext } from "react";
import {
  VerticalContext,
  type VerticalContextValue,
} from "@/context/verticalContext.shared";

export function useVertical(): VerticalContextValue {
  const ctx = useContext(VerticalContext);
  if (!ctx) throw new Error("useVertical must be used within VerticalProvider");
  return ctx;
}

export default useVertical;
