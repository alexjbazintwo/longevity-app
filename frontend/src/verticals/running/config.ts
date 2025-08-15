// src/verticals/running/config.ts
import type { VerticalPack } from "@/types/vertical";

export const runningPack: VerticalPack = {
  slug: "running",
  themeClass: "theme-hybrid",
  brand: {
    name: "Runzi",
    tagline: "Your intelligent running coach",
  },
  hero: {
    headline: "Harness the power of intelligent coaching",
    subhead:
      "From first steps to podium form — fit or on the comeback. An AI-personalised plan that evolves to your needs.",
    ctas: [
      { label: "Start smarter training", to: "/onboarding", kind: "primary" },
      { label: "See my AI-tuned week", to: "/plan-preview", kind: "secondary" },
    ],
    slides: [
      "https://images.pexels.com/photos/891226/pexels-photo-891226.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
    ],
  },
  nav: [
    { label: "Plans", to: "/onboarding" },
    { label: "Paces", to: "/#" },
    { label: "How it works", to: "/#" },
    { label: "Pricing", to: "/#" },
    { label: "Reviews", to: "/#" },
  ],
  goals: [
    {
      key: "c25k",
      title: "Couch → 5K",
      desc: "Walk-run progression, zero to consistent.",
      icon: "Activity",
    },
    {
      key: "5k_pr",
      title: "5K PR",
      desc: "Sharpen speed & economy.",
      icon: "Activity",
    },
    {
      key: "10k_pr",
      title: "10K PR",
      desc: "Threshold focus & endurance.",
      icon: "Activity",
    },
    {
      key: "half_marathon",
      title: "Half Marathon",
      desc: "Tempo strength & long runs.",
      icon: "Timer",
    },
    {
      key: "marathon",
      title: "Marathon",
      desc: "Aerobic base, long runs, fueling.",
      icon: "Timer",
    },
    {
      key: "trail",
      title: "Trail Running",
      desc: "Vert, terrain, technique & strength.",
      icon: "Activity",
    },
  ],
  onboardingSchema: [
    {
      title: "Your race focus",
      subtitle: "Pick an event & timeline",
      fields: [
        {
          type: "singleChoice",
          id: "event",
          label: "Event",
          required: true,
          options: [
            { key: "c25k", label: "Couch → 5K" },
            { key: "5k", label: "5K" },
            { key: "10k", label: "10K" },
            { key: "half", label: "Half Marathon" },
            { key: "marathon", label: "Marathon" },
            { key: "trail", label: "Trail" },
          ],
        },
        {
          type: "singleChoice",
          id: "timeline",
          label: "Plan length",
          required: true,
          options: [
            { key: "12w", label: "12 weeks" },
            { key: "16w", label: "16 weeks" },
            { key: "20w", label: "20 weeks" },
            { key: "24w", label: "24 weeks" },
          ],
        },
        {
          type: "singleChoice",
          id: "experience",
          label: "Running background",
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
      title: "Your constraints",
      subtitle: "Time & current load",
      fields: [
        {
          type: "hoursPerWeek",
          id: "hours",
          label: "Hours per week you can run",
          required: true,
          min: 2,
          max: 12,
        },
        {
          type: "number",
          id: "currentMileage",
          label: "Current weekly mileage (km)",
          required: true,
          min: 0,
          max: 200,
          step: 1,
        },
        {
          type: "text",
          id: "injuries",
          label: "Any injuries or constraints (optional)",
          placeholder: "e.g., Achilles niggle, IT band, plantar",
        },
      ],
    },
    {
      title: "Preferences",
      subtitle: "Where & when you train",
      fields: [
        {
          type: "singleChoice",
          id: "surface",
          label: "Primary surface",
          required: true,
          options: [
            { key: "road", label: "Road" },
            { key: "trail", label: "Trail" },
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
          id: "strengthSupport",
          label: "Include strength",
          required: true,
          options: [
            { key: "none", label: "No" },
            { key: "light", label: "Light (20–30 min)" },
            { key: "full", label: "Full (45–60 min)" },
          ],
        },
      ],
    },
  ],
  planWeights: {
    strength: 0.15,
    zone2: 0.55,
    vo2: 0.2,
    mobility: 0.05,
    sleep: 0.05,
    nutrition: 0.0,
  },
  copy: {
    trust: {
      title: "Built for runners with real lives — and real goals",
      body: "Not a template—Runzi is intelligent coaching. It reads your training, sleep and stress, then adapts load, paces and recovery so progress compounds even when life gets messy.",
    },
    philosophy: {
      title: "Base, build, peak, taper — intelligently",
      body: "We balance aerobic work, threshold and quality sessions with strength and sleep habits. Your plan learns from trends to time your peak without burnout.",
    },
    analytics: {
      title: "Real-time clarity powered by intelligence",
      body: "Auto-calculated paces, fatigue markers and a live week view that rebalances as your data changes. Train with intent, not guesswork.",
    },
  },
  assets: {
    featureImages: [
      "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/3651674/pexels-photo-3651674.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
    ],
  },
};
