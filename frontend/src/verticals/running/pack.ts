import type { ExtendedVerticalPack } from "@/types/vertical";

export const runningPack: ExtendedVerticalPack = {
  slug: "running",
  themeClass: "theme-hybrid",
  brand: { name: "Runzi", tagline: "Your intelligent running coach" },
  hero: {
    headline: "Harness the power of intelligent coaching",
    subhead:
      "From first steps to podium form — fit or on the comeback. An AI-personalised plan that evolves to your needs.",
    ctas: [
      { label: "Start smarter training", to: "/setup", kind: "primary" },
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
    { label: "Plans", to: "/setup" },
    { label: "Paces", to: "/#" },
    { label: "How it works", to: "/#" },
    { label: "Pricing", to: "/#" },
    { label: "Reviews", to: "/#" },
  ],
  goals: [
    {
      key: "c25k",
      title: "Couch → 5K",
      desc: "Walk-run progression.",
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
      desc: "Threshold focus.",
      icon: "Activity",
    },
    {
      key: "half_marathon",
      title: "Half Marathon",
      desc: "Tempo & long runs.",
      icon: "Timer",
    },
    {
      key: "marathon",
      title: "Marathon",
      desc: "Aerobic base & fueling.",
      icon: "Timer",
    },
    {
      key: "trail",
      title: "Trail Running",
      desc: "Vert & technique.",
      icon: "Activity",
    },
  ],
  intakeSchema: [
    {
      title: "Race details",
      subtitle:
        "Tell us about your event so we can tailor your build and taper.",
      fields: [
        {
          type: "singleChoice",
          id: "raceDistance",
          label: "Race distance",
          required: true,
          options: [
            { key: "5k", label: "5K" },
            { key: "10k", label: "10K" },
            { key: "half", label: "Half Marathon" },
            { key: "marathon", label: "Marathon" },
            { key: "ultra", label: "Ultra" },
          ],
        },
        {
          type: "number",
          id: "raceWeeksOut",
          label: "Weeks until race",
          required: true,
          min: 1,
          max: 52,
          step: 1,
        },
        {
          type: "text",
          id: "targetTime",
          label: "Target time",
          required: false,
          placeholder: "Optional (e.g., 1:35:00)",
        },
        {
          type: "text",
          id: "courseNotes",
          label: "Course notes",
          required: false,
          placeholder: "Optional (hilly, hot, trail…)",
        },
      ],
    },
    {
      title: "Distance milestone",
      subtitle: "Not racing? We’ll plan towards a continuous distance goal.",
      fields: [
        {
          type: "singleChoice",
          id: "distanceGoal",
          label: "Milestone",
          required: true,
          options: [
            { key: "5k", label: "5K continuous" },
            { key: "10k", label: "10K continuous" },
            { key: "21k", label: "Half marathon distance" },
            { key: "42k", label: "Marathon distance" },
          ],
        },
        {
          type: "number",
          id: "weeksToMilestone",
          label: "Weeks to milestone",
          required: true,
          min: 1,
          max: 52,
          step: 1,
        },
        {
          type: "singleChoice",
          id: "runWalkPreference",
          label: "Run-walk preference",
          required: false,
          options: [
            { key: "run_walk", label: "Run–walk" },
            { key: "run_only", label: "Run only" },
            { key: "either", label: "Open to either" },
          ],
        },
      ],
    },
    {
      title: "Health focus",
      subtitle: "Build capacity without chasing a race.",
      fields: [
        {
          type: "singleChoice",
          id: "healthFocus",
          label: "What’s the focus?",
          required: true,
          options: [
            { key: "cardio", label: "Cardio capacity" },
            { key: "energy", label: "Energy & vitality" },
            { key: "stress", label: "Stress resilience" },
          ],
        },
        {
          type: "number",
          id: "restingHr",
          label: "Resting heart rate",
          required: false,
          min: 30,
          max: 110,
          step: 1,
        },
        {
          type: "text",
          id: "healthNotes",
          label: "Context",
          required: false,
          placeholder: "Optional (sleep, work stress, etc.)",
        },
      ],
    },
    {
      title: "Comeback",
      subtitle: "If you’re returning, we’ll tread carefully and ramp safely.",
      fields: [
        {
          type: "singleChoice",
          id: "physioCleared",
          label: "Cleared to run?",
          required: true,
          options: [
            { key: "yes", label: "Yes" },
            { key: "no", label: "No" },
            { key: "unsure", label: "Unsure" },
          ],
        },
        {
          type: "text",
          id: "injuryArea",
          label: "Injury/area",
          required: false,
          placeholder: "Optional (e.g., Achilles, ITB)",
        },
        {
          type: "number",
          id: "painNow",
          label: "Pain now (0–10)",
          required: false,
          min: 0,
          max: 10,
          step: 1,
        },
        {
          type: "multiSelect",
          id: "avoidances",
          label: "Avoid for now",
          required: false,
          options: [
            { key: "hills", label: "Hills" },
            { key: "speed", label: "Speedwork" },
            { key: "downhills", label: "Downhills" },
            { key: "long90", label: "Long > 90min" },
            { key: "track", label: "Track" },
            { key: "trails", label: "Trails" },
          ],
        },
      ],
    },
    {
      title: "Time & load",
      subtitle: "We’ll bias intensity and volume around your constraints.",
      fields: [
        {
          type: "hoursPerWeek",
          id: "hours",
          label: "Hours per week",
          required: true,
          min: 0,
          max: 12,
        },
        {
          type: "singleChoice",
          id: "units",
          label: "Distance units",
          required: true,
          options: [
            { key: "km", label: "Kilometres (km)" },
            { key: "mi", label: "Miles (mi)" },
          ],
        },
        {
          type: "number",
          id: "currentMileage",
          label: "Current weekly distance",
          required: false,
          min: 0,
          max: 300,
          step: 1,
        },
      ],
    },
    {
      title: "Preferences",
      subtitle:
        "A few choices that shape surfaces, support and accountability.",
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
          id: "strengthSupport",
          label: "Include strength",
          required: false,
          options: [
            { key: "none", label: "No" },
            { key: "light", label: "Light (20–30 min)" },
            { key: "full", label: "Full (45–60 min)" },
          ],
          placeholder: "Strength supports injury prevention and resilience.",
        },
        {
          type: "singleChoice",
          id: "mobility",
          label: "Mobility / stretching",
          required: false,
          options: [
            { key: "none", label: "None" },
            { key: "short", label: "Short (5–10 min)" },
            { key: "standard", label: "Standard (10–15 min)" },
            { key: "long", label: "Long (20+ min)" },
          ],
        },
        {
          type: "multiSelect",
          id: "gear",
          label: "Gear you use",
          required: false,
          options: [
            { key: "watch", label: "GPS watch" },
            { key: "hr", label: "Heart-rate strap" },
            { key: "footpod", label: "Footpod" },
            { key: "treadmill", label: "Treadmill" },
            { key: "none", label: "No gadgets" },
          ],
        },
        {
          type: "multiSelect",
          id: "dataSources",
          label: "Connected apps",
          required: false,
          options: [
            { key: "garmin", label: "Garmin" },
            { key: "strava", label: "Strava" },
            { key: "apple", label: "Apple Health" },
            { key: "polar", label: "Polar Flow" },
            { key: "coros", label: "Coros" },
            { key: "suunto", label: "Suunto" },
            { key: "none", label: "None" },
          ],
        },
        {
          type: "singleChoice",
          id: "coachingStyle",
          label: "Coaching style",
          required: false,
          options: [
            { key: "gentle", label: "Gentle" },
            { key: "data", label: "Data-driven" },
            { key: "direct", label: "Direct" },
            { key: "minimal", label: "Minimal" },
          ],
          placeholder: "Affects tone, detail, and frequency of nudges.",
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
      text: "No templates. Coach Kaia adjusts paces, long-run structure and recovery to your sleep, stress, and consistency — so each week targets what moves you forward.",
      bullets: [
        "Auto-calculated training paces",
        "Adaptive long runs & recovery",
        "Progress you can feel",
      ],
      image:
        "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
      icon: "HeartPulse",
      reverse: false,
    },
    {
      key: "prChasing",
      title: "Chasing a PR? Periodize and peak at the right time",
      text: "We tune threshold/VO₂ work, long-run structure and taper timing from your data. Honest paces keep you fast without burnout.",
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
      text: "The first plan that adapted to my life. I PR’d by 9 minutes.",
    },
    {
      name: "Daniel P.",
      role: "10K/Engineer",
      text: "Kaia catches fatigue before I do. I kept progressing, injury-free.",
    },
    {
      name: "Chloe R.",
      role: "Half Marathon",
      text: "The structure removed guesswork. I finally improved consistently.",
    },
  ],
  assets: { featureImages: [] },
};

export const packs = {
  running: runningPack,
} as const;

export type VerticalKey = keyof typeof packs;

export function getPack(key: VerticalKey): ExtendedVerticalPack {
  return packs[key];
}
