import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVertical } from "@/context/verticalContext";
import { Trophy, Activity, Clock3 } from "lucide-react";

type Answers = Record<string, string | number>;

type DayPlan = {
  day: string;
  title: string;
  details: string;
};

function buildSimplePlan(answers: Answers): DayPlan[] {
  const experience = (answers.experience as string) || "beginner";
  const hours = Number(answers.hours ?? 4);
  const easyMins = Math.round((hours * 60) / 4);
  const qualityMins = Math.round((hours * 60) / 6);
  const quality =
    experience === "advanced"
      ? qualityMins + 20
      : experience === "intermediate"
      ? qualityMins + 10
      : qualityMins;

  return [
    { day: "Mon", title: "Easy run", details: `${easyMins} min Z2 + mobility` },
    {
      day: "Tue",
      title: "Quality",
      details: `${quality} min threshold/intervals`,
    },
    {
      day: "Wed",
      title: "Easy or rest",
      details: `${Math.max(30, easyMins - 10)} min Z2 or rest`,
    },
    {
      day: "Thu",
      title: "Quality",
      details: `${quality - 10} min tempo + strides`,
    },
    {
      day: "Fri",
      title: "Recovery",
      details: `30–40 min very easy + mobility`,
    },
    {
      day: "Sat",
      title: "Long run",
      details: `${Math.round(hours * 60 * 0.4)} min with last 10 min steady`,
    },
    { day: "Sun", title: "Optional", details: `20–30 min easy or rest` },
  ];
}

export default function PlanPreview() {
  const navigate = useNavigate();
  const { pack } = useVertical();
  const [answers, setAnswers] = useState<Answers | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("intakeAnswers");
    if (!saved) {
      navigate("/setup", { replace: true });
      return;
    }
    setAnswers(JSON.parse(saved));
  }, [navigate]);

  const week = useMemo(
    () => (answers ? buildSimplePlan(answers) : []),
    [answers]
  );

  if (!answers) return null;

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(99,102,241,0.10),rgba(16,185,129,0.08))]" />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-white/70">
            Preview
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your AI-tuned week, {pack.brand.name}
          </h1>
          <p className="mt-2 text-white/80">
            Based on your setup answers. Adjust anytime.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="rounded-2xl border-indigo-300/15 bg-indigo-500/10 ring-1 ring-indigo-400/10">
            <CardContent className="flex items-center gap-3 p-4">
              <Activity className="h-5 w-5" />
              <div className="text-sm">
                Weekly load tuned to your experience
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-indigo-300/15 bg-indigo-500/10 ring-1 ring-indigo-400/10">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock3 className="h-5 w-5" />
              <div className="text-sm">
                Quality sessions spaced for recovery
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-indigo-300/15 bg-indigo-500/10 ring-1 ring-indigo-400/10">
            <CardContent className="flex items-center gap-3 p-4">
              <Trophy className="h-5 w-5" />
              <div className="text-sm">Long run progression you can feel</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {week.map((d) => (
            <Card
              key={d.day}
              className="rounded-2xl border-white/10 bg-white/5 backdrop-blur"
            >
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-wider text-white/70">
                  {d.day}
                </div>
                <div className="mt-1 text-lg font-semibold">{d.title}</div>
                <div className="mt-1 text-sm text-white/85">{d.details}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button className="rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black">
            Start free
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={() => navigate("/setup")}
          >
            Tweak setup
          </Button>
          <Link
            to="/"
            className="self-center text-sm text-white/70 underline underline-offset-4"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
