import { runningPack } from "@/verticals/running/pack";

const packs = {
  running: runningPack,
};
export type VerticalSlug = keyof typeof packs;

export function getPack(slug: VerticalSlug) {
  return packs[slug] ?? packs.running;
}

export { runningPack };
