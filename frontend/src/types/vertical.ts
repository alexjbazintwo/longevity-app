// src/types/vertical.ts
import type { IntakeSchema } from "@/types/intake";

/** CTA buttons used in hero, etc. */
export type HeroCTA = {
  label: string;
  to: string;
  kind: "primary" | "secondary";
};

/** Simple feature card used on the home page. */
export type Feature = {
  key: string;
  title: string;
  text: string;
  bullets: string[];
  image: string;
  icon: string; // lucide icon name string (e.g. "HeartPulse")
  reverse?: boolean;
};

/** Testimonial card. */
export type Review = {
  name: string;
  role: string;
  text: string;
};

/** Optional: lightweight nav link shape. */
export type NavLink = {
  label: string;
  to: string;
};

/** NEW: optional flow configuration to drive setup UX. */
export type VerticalFlow = {
  /** If true, show a Quick Start (chat-style) step before motives. */
  chatFirst?: boolean;

  /** If true and user selects multiple motives, require selecting a priority. */
  requirePriority?: boolean;

  /** Motives shown on the first step; anchor each to a field id in the schema. */
  motives?: Array<{
    key: string; // "race" | "distance" | "health" | "comeback" | "habit"
    label: string;
    hint?: string;
    /** The field id in intakeSchema that represents the section anchor for this motive. */
    anchorFieldId: string;
  }>;

  /** Section field ids that should always be appended (deduped) after motive-driven sections. */
  commonSectionAnchors?: string[];
};

/** Top-level content/config pack for a vertical (running, cycling, etc.). */
export type VerticalPack = {
  slug: string;
  themeClass?: string;

  brand: {
    name: string;
    tagline?: string;
  };

  hero: {
    headline: string;
    subhead: string;
    ctas: HeroCTA[];
    slides: string[];
    /** Optional per-image focal point for object-position */
    objectPosition?: Record<string, string>;
    /** Optional per-image credit map */
    credits?: Record<
      string,
      {
        label: string;
        href: string;
      }
    >;
  };

  nav?: NavLink[];
  goals?: unknown[];

  /** The intake schema that powers the setup flow. */
  intakeSchema: IntakeSchema;

  /** Weights used in plan generation (optional/flexible). */
  planWeights?: Record<string, number>;

  /** Copy blocks; keep loose to avoid over-typing your content. */
  copy?: Record<string, unknown>;

  /** Trust badges, etc. */
  trust?: {
    badges?: string[];
  };

  /** Proof section content (stats, notes). */
  proof?: Record<string, unknown>;

  /** Outcomes section content. */
  outcomes?: {
    title: string;
    items: Array<{ label: string; value: string }>;
  };

  /** Home page features list. */
  features?: Feature[];

  /** CTA blocks (e.g., smartAnalytics). */
  cta?: Record<string, unknown>;

  /** Testimonials. */
  reviews?: Review[];

  /** Any asset references. */
  assets?: Record<string, unknown>;

  /** NEW: optional flow config to control the setup UX. */
  flow?: VerticalFlow;
};
