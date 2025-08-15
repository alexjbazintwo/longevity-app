export type OnboardingField =
  | {
      type: "singleChoice";
      id: string;
      label: string;
      required?: boolean;
      options: { key: string; label: string }[];
    }
  | {
      type: "multiChoice";
      id: string;
      label: string;
      required?: boolean;
      options: { key: string; label: string }[];
    }
  | {
      type: "number";
      id: string;
      label: string;
      required?: boolean;
      min?: number;
      max?: number;
      step?: number;
    }
  | {
      type: "hoursPerWeek";
      id: string;
      label: string;
      required?: boolean;
      min: number;
      max: number;
    }
  | {
      type: "text";
      id: string;
      label: string;
      required?: boolean;
      placeholder?: string;
    };

export type OnboardingStep = {
  title: string;
  subtitle?: string;
  fields: OnboardingField[];
};

export type PlanWeights = {
  strength: number;
  zone2: number;
  vo2: number;
  mobility: number;
  sleep: number;
  nutrition: number;
};

export type VerticalPack = {
  /** short slug like "hybrid" or "masters" */
  slug: string;
  /** CSS theme class to attach to <body> (e.g., "theme-hybrid") */
  themeClass: string;

  brand: {
    name: string;
    tagline: string;
  };

  hero: {
    headline: string;
    subhead: string;
    ctas: { label: string; to: string; kind: "primary" | "secondary" }[];
    slides: string[];
  };

  nav: { label: string; to: string }[];

  goals: { key: string; title: string; desc: string; icon: string }[];

  onboardingSchema: OnboardingStep[];

  planWeights: PlanWeights;

  copy: {
    trust: { title: string; body: string };
    philosophy: { title: string; body: string };
    analytics: { title: string; body: string };
  };

  assets: {
    featureImages: string[]; // 3 images used on home "feature" rows
  };

  /** Optional custom plan strategy hook-in (we'll wire later) */
  planStrategy?: (state: Record<string, unknown>) => PlanWeights;
};
