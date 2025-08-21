// src/data/homePack.ts
// Plain content object for the Home page (no contexts/providers).

export const homePack = {
  brand: { tagline: "Your intelligent running coach" },

  hero: {
    headline: "Harness the power of intelligent coaching",
    subhead:
      "From first steps to podium form — fit or on the comeback. An AI-personalised plan that evolves to your needs.",
    ctas: [
      { label: "Start smarter training", to: "/setup", kind: "primary" },
      { label: "See my AI-tuned week", to: "/plan-preview", kind: "secondary" },
    ],
    slides: [
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Berlin-Marathon_2023_Eliud_Kipchoge_bei_Kilometer_25_A.jpg",
      "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/891226/pexels-photo-891226.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
    ],
    objectPosition: {
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Berlin-Marathon_2023_Eliud_Kipchoge_bei_Kilometer_25_A.jpg":
        "50% 35%",
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Paris2024_-_Triathlon_-_19_-_Alex_Yee.jpg":
        "50% 12%",
    },
    credits: {
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Berlin-Marathon_2023_Eliud_Kipchoge_bei_Kilometer_25_A.jpg":
        {
          label: "Eliud Kipchoge — Wikimedia Commons (CC BY-SA 4.0)",
          href: "https://commons.wikimedia.org/wiki/File:Berlin-Marathon_2023_Eliud_Kipchoge_bei_Kilometer_25_A.jpg",
        },
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Paris2024_-_Triathlon_-_19_-_Alex_Yee.jpg":
        {
          label: "Alex Yee — Rz98 (CC BY-SA 4.0)",
          href: "https://commons.wikimedia.org/wiki/File:Paris2024_-_Triathlon_-_19_-_Alex_Yee.jpg",
        },
    },
  },

  copy: {
    trust: {
      title: "Built for runners with real lives — and real goals",
      body: "Not a template—Runzi is intelligent coaching. It reads your training, sleep and stress, then adapts load, paces and recovery so progress compounds even when life gets messy.",
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
        "https://upload.wikimedia.org/wikipedia/commons/f/fd/PARIS_JOP_2024_TEST_EVENT_TRIATHLON_AUGUST_2023_%2853124751486%29.jpg",
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
} as const;
