import type { VerticalPack } from "./vertical";

export type IconName =
  | "HeartPulse"
  | "Trophy"
  | "Activity"
  | "Brain"
  | "LineChart";

export type ProofStatItem = { value: string; label: string; note?: string };
export type OutcomeItem = { label: string; value: string };
export type CTAStat = { icon: IconName; label: string; value: string };

export type FeatureBlock = {
  key: string;
  title: string;
  text: string;
  bullets: string[];
  image: string;
  icon: IconName;
  reverse?: boolean;
};

type BaseHero = VerticalPack["hero"];

export type ExtendedHero = BaseHero & {
  objectPosition?: Record<string, string>;
  credits?: Record<string, { label: string; href: string }>;
};

export type ExtendedVerticalPack = Omit<VerticalPack, "hero"> & {
  hero: ExtendedHero;
  trust?: { badges: string[] };
  proof: { title: string; stats: ProofStatItem[]; footnote: string };
  outcomes: { title: string; items: OutcomeItem[] };
  features: FeatureBlock[];
  cta: { smartAnalytics: { title: string; body: string; stats: CTAStat[] } };
  reviews: { name: string; role: string; text: string }[];
};
