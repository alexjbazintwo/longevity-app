import type { ExtendedVerticalPack } from "@/types/vertical-extended";

export const runningPack: ExtendedVerticalPack = {
  slug: "running",
  themeClass: "theme-hybrid",
  brand: { name: "Runzi", tagline: "Your intelligent running coach" },
  hero: {
    headline: "Harness the power of intelligent coaching",
    subhead:
      "From first steps to podium form — fit or on the comeback. An AI-personalised plan that evolves to your needs.",
    ctas: [
      { label: "Start smarter training", to: "/onboarding", kind: "primary" },
      { label: "See my AI-tuned week", to: "/plan-preview", kind: "secondary" },
    ],
    slides: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Paris2024_-_Triathlon_-_19_-_Alex_Yee.jpg",
      "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/891226/pexels-photo-891226.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
    ],
    objectPosition: {
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Paris2024_-_Triathlon_-_19_-_Alex_Yee.jpg":
        "50% 18%",
    },
    credits: {
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Paris2024_-_Triathlon_-_19_-_Alex_Yee.jpg":
        {
          label: "Alex Yee — Rz98 (CC BY-SA 4.0)",
          href: "https://commons.wikimedia.org/wiki/File:Paris2024_-_Triathlon_-_19_-_Alex_Yee.jpg",
        },
    },
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
  trust: { badges: ["AI Paces", "Coaching", "Insights"] },
  proof: {
    title: "Why AI beats templates",
    stats: [
      { value: "2.2×", label: "Higher PR rate", note: "at target race" },
      {
        value: "+35%",
        label: "Comfortable distance",
        note: "longest run in 12 wks",
      },
      { value: "-30%", label: "Injury days", note: "per training block" },
      { value: "+29%", label: "Plan adherence", note: "vs static plans" },
    ],
    footnote:
      "Internal cohort; illustrative for preview. Individual results vary.",
  },
  outcomes: {
    title: "What runners improve with Coach Kaia (median after 12–24 weeks):",
    items: [
      { label: "race time (12–24 wks)", value: "-3.4%" },
      { label: "resting heart rate", value: "-7 bpm" },
      { label: "injury days per block", value: "-23%" },
      { label: "plan adherence", value: "+29%" },
    ],
  },
  features: [
    {
      key: "aiPlanning",
      title: "Personalised plans that adapt every week",
      text: "No templates. Coach Kaia adjusts paces, long-run structure and recovery to your sleep, stress, and consistency — so each week targets exactly what moves you forward.",
      bullets: [
        "Auto-calculated training paces",
        "Adaptive long runs & recovery",
        "Progress you can actually feel",
      ],
      image:
        "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      icon: "HeartPulse",
      reverse: false,
    },
    {
      key: "prChasing",
      title: "Chasing a PR? Periodize and peak at the right time",
      text: "We tune threshold/VO₂ work, long-run structure and taper timing from your data. Honest paces keep you fast without flirting with burnout.",
      bullets: [
        "Auto-paced quality sessions",
        "Block-by-block periodization",
        "Smart taper & race-week cues",
      ],
      image:
        "https://upload.wikimedia.org/wikipedia/commons/b/b2/Berlin-Marathon_2023_Eliud_Kipchoge_bei_Kilometer_25_A.jpg",
      icon: "Trophy",
      reverse: true,
    },
    {
      key: "beginner",
      title: "Beginner or coming back? We’ll pace your ramp safely",
      text: "Walk-run options, gradual load and timely deloads — all nudged by your trends. Build the habit, dodge flare-ups, enjoy the wins.",
      bullets: [
        "Walk-run & low-impact options",
        "Gentle weekly progression",
        "Confidence-building milestones",
      ],
      image:
        "https://images.pexels.com/photos/6551225/pexels-photo-6551225.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      icon: "Activity",
      reverse: false,
    },
    {
      key: "analytics",
      title: "Real-time analytics you can act on",
      text: "From race-pace zones to training load — see what matters this week and what to ignore. Clarity beats motivation.",
      bullets: [
        "VO₂ proxy & thresholds",
        "Zone 2 vs quality balance",
        "Fatigue vs fitness trends",
      ],
      image:
        "https://images.pexels.com/photos/24426021/pexels-photo-24426021.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      icon: "Brain",
      reverse: true,
    },
    {
      key: "fatigue",
      title: "Coach Kaia catches fatigue early",
      text: "We watch consistency and HR trends to flag early fatigue or niggles — then auto-adjust sessions and recovery before small issues become big ones.",
      bullets: [
        "Daily nudges",
        "Stress & load balance",
        "Micro-adjusted sessions",
      ],
      image:
        "https://images.pexels.com/photos/7298629/pexels-photo-7298629.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      icon: "LineChart",
      reverse: false,
    },
  ],
  cta: {
    smartAnalytics: {
      title: "Fit to 100 Smart Analytics",
      body: "Not templates—intelligence. Our AI coach adapts your training as your data changes. Hit your PR or build a running habit for life, without the guesswork.",
      stats: [
        { icon: "Activity", label: "Weekly km", value: "+28" },
        { icon: "HeartPulse", label: "Resting HR", value: "-6 bpm" },
        { icon: "Brain", label: "Stress score", value: "-18%" },
        { icon: "LineChart", label: "Threshold pace", value: "+12s/km" },
      ],
    },
  },
  reviews: [
    {
      name: "Amira S.",
      role: "Marathoner",
      text: "The first plan that adapted to my life. My long runs finally clicked—and I PR’d by 9 minutes.",
    },
    {
      name: "Daniel P.",
      role: "10K/Engineer",
      text: "Coach Kaia catches fatigue before I do. The tweaks kept me healthy and progressing.",
    },
    {
      name: "Chloe R.",
      role: "Half Marathon",
      text: "The paces and structure removed guesswork. I stopped winging it and started improving.",
    },
  ],
  assets: {
    featureImages: [
      "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/891226/pexels-photo-891226.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
    ],
  },
};
