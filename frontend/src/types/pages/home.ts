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

export type HomeHeroExtras = {
  objectPosition?: Record<string, string>;
  credits?: Record<string, { label: string; href: string }>;
};

export type HomeContent = {
  heroExtras?: HomeHeroExtras;
  proof: { title: string; stats: ProofStatItem[]; footnote: string };
  outcomes: { title: string; items: OutcomeItem[]; footnote?: string };
  features: FeatureBlock[];
  cta: {
    smartAnalytics: {
      title: string;
      body: string;
      primaryCta: { label: string; to: string };
      secondaryCta?: { label: string; to: string };
      stats: CTAStat[];
    };
  };
  labels?: { featureChip: string };
  reviewsTitle: string;
  reviews: { name: string; role: string; text: string }[];
};
