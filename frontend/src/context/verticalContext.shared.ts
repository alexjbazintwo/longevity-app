import { createContext } from "react";
import type { ExtendedVerticalPack } from "@/types/vertical";

export type VerticalKey = "running";

export type VerticalContextValue = {
  pack: ExtendedVerticalPack;
  setVertical: (key: VerticalKey) => void;
};

export const VerticalContext = createContext<VerticalContextValue | undefined>(
  undefined
);
