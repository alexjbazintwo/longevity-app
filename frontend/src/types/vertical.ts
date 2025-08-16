import type { IntakeSchema } from "./intake";

export type CTAKind = "primary" | "secondary";

export type Brand = {
  name: string;
  tagline: string;
};

export type HeroCTA = {
  label: string;
  to: string;
  kind: CTAKind;
};

export type Hero = {
  headline: string;
  subhead: string;
  ctas: HeroCTA[];
  slides: string[];
};

export type NavItem = {
  label: string;
  to: string;
};

export type Goal = {
  key: string;
  title: string;
  desc: string;
  icon: string;
};

export type PlanWeights = {
  strength: number;
  zone2: number;
  vo2: number;
  mobility: number;
  sleep: number;
  nutrition: number;
};

export type CopyBlock = {
  title: string;
  body: string;
};

export type Copy = {
  trust: CopyBlock;
  philosophy: CopyBlock;
  analytics: CopyBlock;
};

export type Assets = {
  featureImages: string[];
};

export type VerticalPack = {
  slug: string;
  themeClass: string;
  brand: Brand;
  hero: Hero;
  nav: NavItem[];
  goals: Goal[];
  intakeSchema: IntakeSchema;
  planWeights: PlanWeights;
  copy: Copy;
  assets: Assets;
};

export type IconName =
  | "HeartPulse"
  | "Trophy"
  | "Activity"
  | "Brain"
  | "LineChart";

export type ProofStatItem = {
  value: string;
  label: string;
  note?: string;
};

export type OutcomeItem = {
  label: string;
  value: string;
};

export type CTAStat = {
  icon: IconName;
  label: string;
  value: string;
};

export type FeatureBlock = {
  key: string;
  title: string;
  text: string;
  bullets: string[];
  image: string;
  icon: IconName;
  reverse?: boolean;
};

export interface ExtendedHero extends Hero {
  objectPosition?: Record<string, string>;
  credits?: Record<string, { label: string; href: string }>;
}

export interface ExtendedVerticalPack extends Omit<VerticalPack, "hero"> {
  hero: ExtendedHero;
  trust?: { badges: string[] };
  proof: { title: string; stats: ProofStatItem[]; footnote: string };
  outcomes: { title: string; items: OutcomeItem[] };
  features: FeatureBlock[];
  cta: { smartAnalytics: { title: string; body: string; stats: CTAStat[] } };
  reviews: { name: string; role: string; text: string }[];
}
