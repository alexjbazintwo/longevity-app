// src/verticals/index.ts
import type { VerticalPack } from "@/types/vertical";
import { hybridPack } from "@/verticals/hybrid/config";
import { runningPack } from "@/verticals/running/config";

export const PACKS: Record<string, VerticalPack> = {
  hybrid: hybridPack,
  running: runningPack,
  // masters: mastersPack, // later
};

export function getPack(slug?: string): VerticalPack {
  const key = (slug ?? "").toLowerCase();
  return PACKS[key] ?? runningPack; // default to running
}
