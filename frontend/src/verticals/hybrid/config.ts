import type { VerticalPack } from "@/types/vertical";

export const hybridPack: VerticalPack = {
  slug: "hybrid",
  themeClass: "theme-hybrid",
  brand: {
    name: "FIT to 100",
    tagline: "Build an engine. Stay strong.",
  },
  hero: {
    headline: "Build an engine. Stay strong. 3–6 hrs/week.",
    subhead:
      "Adaptive run/ride + strength plans that fit your week and protect recovery.",
    ctas: [
      { label: "Get my plan", to: "/onboarding", kind: "primary" },
      {
        label: "Engine & Recovery audit",
        to: "/life-expectancy-form",
        kind: "secondary",
      },
    ],
    // Using your current hero images
    slides: [
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1600&auto=format&fit=crop",
    ],
  },
  nav: [
    { label: "Get My Plan", to: "/onboarding" },
    { label: "Longevity Test", to: "/life-expectancy-form" },
    { label: "Pricing", to: "/#" },
    { label: "Science", to: "/#" },
    { label: "Reviews", to: "/#" },
  ],
  goals: [
    {
      key: "hybrid_performance",
      title: "Hybrid Performance",
      desc: "Run/Ride + Strength, time-boxed.",
      icon: "Dumbbell",
    },
    {
      key: "masters_endurance",
      title: "Masters Endurance",
      desc: "Performance with joint-smart recovery.",
      icon: "Timer",
    },
    {
      key: "aesthetic_athletic",
      title: "Sculpt & Perform",
      desc: "Strong, lean, photo-ready.",
      icon: "Sparkles",
    },
  ],
  onboardingSchema: [
    {
      title: "Goal focus",
      subtitle: "Pick your focus",
      fields: [
        {
          type: "singleChoice",
          id: "goal",
          label: "Focus",
          required: true,
          options: [
            { key: "hybrid_performance", label: "Hybrid Performance" },
            { key: "masters_endurance", label: "Masters Endurance" },
            { key: "aesthetic_athletic", label: "Sculpt & Perform" },
          ],
        },
        {
          type: "singleChoice",
          id: "experience",
          label: "Experience",
          required: true,
          options: [
            { key: "beginner", label: "Beginner" },
            { key: "intermediate", label: "Intermediate" },
            { key: "advanced", label: "Advanced" },
          ],
        },
      ],
    },
    {
      title: "Constraints",
      subtitle: "Time & equipment",
      fields: [
        {
          type: "hoursPerWeek",
          id: "hours",
          label: "Hours per week",
          required: true,
          min: 2,
          max: 10,
        },
        {
          type: "singleChoice",
          id: "equipment",
          label: "Equipment",
          required: true,
          options: [
            { key: "none", label: "No equipment" },
            { key: "minimal", label: "Minimal" },
            { key: "full_gym", label: "Full gym" },
          ],
        },
        {
          type: "text",
          id: "injuries",
          label: "Injuries or constraints (optional)",
          placeholder: "e.g., knee pain, shoulder strain",
        },
      ],
    },
    {
      title: "Preferences",
      subtitle: "When & where",
      fields: [
        {
          type: "singleChoice",
          id: "modality",
          label: "Primary modality",
          required: true,
          options: [
            { key: "run", label: "Run" },
            { key: "ride", label: "Ride" },
            { key: "mix", label: "Mix" },
          ],
        },
        {
          type: "singleChoice",
          id: "timeOfDay",
          label: "Time of day",
          required: true,
          options: [
            { key: "morning", label: "Morning" },
            { key: "evening", label: "Evening" },
            { key: "varies", label: "Varies" },
          ],
        },
        {
          type: "singleChoice",
          id: "location",
          label: "Location",
          required: true,
          options: [
            { key: "home", label: "Home" },
            { key: "gym", label: "Gym" },
            { key: "outdoors", label: "Outdoors" },
            { key: "mix", label: "Mix" },
          ],
        },
      ],
    },
  ],
  planWeights: {
    strength: 0.35,
    zone2: 0.35,
    vo2: 0.15,
    mobility: 0.1,
    sleep: 0.05,
    nutrition: 0.0,
  },
  copy: {
    trust: {
      title: "Built for busy athletes",
      body: "Time-boxed polarized training with compact strength and recovery guardrails.",
    },
    philosophy: {
      title: "Engine + Strength",
      body: "We combine Zone 2 base, VO₂ intervals, and joint-smart lifting you can sustain.",
    },
    analytics: {
      title: "Smart Analytics",
      body: "See VO₂ proxy, session momentum, and load—your week auto-rebalances.",
    },
  },
  assets: {
    featureImages: [
      "https://images.unsplash.com/photo-1516222338250-863216ce01ea?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1600&auto=format&fit=crop",
    ],
  },
};
