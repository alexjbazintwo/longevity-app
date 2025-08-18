import type { IntakeSchema } from "@/types/intake";

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
  objectPosition?: Record<string, string>;
  credits?: Record<string, { label: string; href: string }>;
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

/* ——— Optional content blocks used by Home ——— */

export type Proof = {
  title: string;
  stats: { value: string; label: string; note?: string }[];
  footnote: string;
};

export type Outcomes = {
  title: string;
  items: { label: string; value: string }[];
};

export type Feature = {
  key: string;
  title: string;
  text: string;
  bullets: string[];
  image: string;
  icon: string; // mapped at render-time
  reverse?: boolean;
};

export type CTA = {
  smartAnalytics: {
    title: string;
    body: string;
    stats: { icon: string; label: string; value: string }[];
  };
};

export type Review = {
  name: string;
  role: string;
  text: string;
};

export type Trust = {
  badges: string[];
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

  /* Optional, but used by Home if present */
  trust?: Trust;
  proof?: Proof;
  outcomes?: Outcomes;
  features?: Feature[];
  cta?: CTA;
  reviews?: Review[];
};
