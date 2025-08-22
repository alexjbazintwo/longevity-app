// src/components/features/plan-setup/wizardChat.tsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import ChatWizardContext from "@/context/chatWizardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, RotateCw } from "lucide-react";
import {
  digitsToHMS,
  digitsToMMSS,
  formatHMSFromDigits,
  formatMMSSFromDigits,
  hmsCaretIndex,
  mmssCaretIndex,
} from "@/utils";

function isIntroMessage(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("i’m coach kaia") ||
    t.includes("i'm coach kaia") ||
    t.includes("tune paces and recovery") ||
    t.includes("this takes ~2–3 minutes") ||
    t.includes("this takes ~2-3 minutes")
  );
}

function computeProgressPercent(
  node: string,
  answers: Record<string, string | number>
): number {
  const reason = (answers["reason"] as string) || "";
  const goalKind = (answers["goalKind"] as string) || "";
  const hasRaceDate = typeof answers["raceDate"] === "string";

  const steps: string[] = ["askName", "askAge", "askReason", "askUnits"];

  if (reason === "health") {
    steps.push(
      "askPrimaryOutcome",
      "planLength",
      "askHours",
      "askMileage",
      "askComfortablePace",
      "askLongestTime"
    );
  } else {
    steps.push("askGoalKind", "askDistance");
    if (goalKind === "race" || goalKind === "") {
      steps.push("askRaceDate");
      steps.push(
        "askCurrentTime",
        "askTargetTime",
        "askRecent5k",
        "askComfortablePace",
        "askHours",
        "askMileage",
        "askLongestTime"
      );
    } else if (goalKind === "time") {
      steps.push(
        "askTargetTime",
        "askCurrentTime",
        "askRecent5k",
        "askComfortablePace",
        "askHours",
        "askMileage",
        "askLongestTime"
      );
    } else if (goalKind === "distance") {
      steps.push(
        "planLength",
        "askComfortablePace",
        "askHours",
        "askMileage",
        "askLongestTime"
      );
    }
  }

  steps.push(
    "askInjuries",
    "askSafeDistance",
    "askSafePace",
    "askAddOns",
    "confirm"
  );

  const mapNode = (n: string): string =>
    n === "askWindowUnit" || n === "askHorizonWeeks" || n === "askHorizonMonths"
      ? "planLength"
      : n;

  const logical = mapNode(node);
  const idx = Math.max(0, steps.indexOf(logical));
  const denom = steps.length - 1;
  if (denom <= 0) return 0;

  if (
    logical === "askRaceDate" &&
    !hasRaceDate &&
    (answers["raceDateChoice"] as string) === "noDate"
  ) {
    const i = steps.indexOf("askRaceDate");
    const j = i >= 0 ? i : idx;
    return Math.round(((j + 1) / denom) * 100);
  }

  return Math.round((idx / denom) * 100);
}

export function WizardChat() {
  const ctx = useContext(ChatWizardContext)!;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [timeDigits, setTimeDigits] = useState("");
  const [paceDigits, setPaceDigits] = useState("");
  const [numDigits, setNumDigits] = useState("");

  const pct = useMemo(
    () => computeProgressPercent(ctx.node, ctx.answers),
    [ctx.node, ctx.answers]
  );
  const filteredMessages = useMemo(
    () => ctx.messages.filter((m) => !isIntroMessage(m.text)),
    [ctx.messages]
  );

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [filteredMessages.length]);

  useEffect(() => {
    setSelected(null);
    setText("");
    setDateVal("");
    setTimeDigits("");
    setPaceDigits("");
    setNumDigits("");

    const a = ctx.answers || {};
    switch (ctx.node) {
      case "askName": {
        if (typeof a.name === "string") setText(a.name);
        break;
      }
      case "askAge": {
        if (typeof a.age === "number") {
          const val = String(a.age);
          setNumDigits(val);
          setSelected(val);
        }
        break;
      }
      case "askReason": {
        setSelected(typeof a.reason === "string" ? a.reason : null);
        break;
      }
      case "askGoalKind": {
        setSelected(typeof a.goalKind === "string" ? a.goalKind : null);
        break;
      }
      case "askPrimaryOutcome": {
        break;
      }
      case "askUnits": {
        setSelected(typeof a.units === "string" ? a.units : null);
        break;
      }
      case "askDistance": {
        setSelected(typeof a.raceDistance === "string" ? a.raceDistance : null);
        break;
      }
      case "askRaceDate": {
        if (typeof a.raceDate === "string") setDateVal(a.raceDate);
        if ((a.raceDateChoice as string) === "noDate") setSelected("noDate");
        break;
      }
      case "askWindowUnit": {
        if ((a.windowUnit as string) === "weeks") setSelected("weeks");
        else if ((a.windowUnit as string) === "months") setSelected("months");
        else if (typeof a.goalHorizonWeeks === "string") setSelected("weeks");
        else if (typeof a.goalHorizonMonths === "string") setSelected("months");
        break;
      }
      case "askHorizonWeeks": {
        if (typeof a.goalHorizonWeeks === "string") {
          const val = a.goalHorizonWeeks.replace(/\D+/g, "");
          setNumDigits(val);
          setSelected(val || null);
        }
        break;
      }
      case "askHorizonMonths": {
        if (typeof a.goalHorizonMonths === "string") {
          const val = a.goalHorizonMonths.replace(/\D+/g, "");
          setNumDigits(val);
          setSelected(val || null);
        }
        break;
      }
      case "askCurrentTime": {
        if ((a.askCurrentTimeSkipped as string) === "yes") setSelected("skip");
        if (typeof a.currentFitnessTime === "string") {
          const parts = a.currentFitnessTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      case "askTargetTime": {
        if ((a.askTargetTimeSkipped as string) === "yes") setSelected("skip");
        if (typeof a.targetTime === "string") {
          const parts = a.targetTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      case "askRecent5k": {
        if ((a.askRecent5kSkipped as string) === "yes") setSelected("skip");
        if (typeof a.recent5kTime === "string") {
          const parts = a.recent5kTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      case "askComfortablePace": {
        if ((a.askComfortablePaceSkipped as string) === "yes")
          setSelected("skip");
        if (typeof a.comfortablePace === "string") {
          const parts = a.comfortablePace.split(":");
          if (parts.length === 2) setPaceDigits(parts[0] + parts[1]);
        }
        break;
      }
      case "askHours": {
        if (typeof a.hours === "number") {
          const val = String(a.hours);
          setNumDigits(val);
          setSelected(val);
        }
        break;
      }
      case "askMileage": {
        if (typeof a.currentMileage === "number") {
          const val = String(a.currentMileage);
          setNumDigits(val);
          setSelected(val);
        }
        break;
      }
      case "askLongestTime": {
        if ((a.askLongestTimeSkipped as string) === "yes") setSelected("skip");
        if (typeof a.longestRunTime === "string") {
          const parts = a.longestRunTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      case "askInjuries": {
        if (typeof a.injuryOther === "string") setText(a.injuryOther);
        break;
      }
      case "askSafeDistance": {
        if (typeof a.safeDistanceKm === "number") {
          const val = String(a.safeDistanceKm);
          setNumDigits(val);
          setSelected(val);
        }
        break;
      }
      case "askSafePace": {
        if ((a.askSafePaceSkipped as string) === "yes") setSelected("skip");
        const sp =
          typeof a.safePace === "string"
            ? a.safePace
            : typeof a.injurySafePace === "string"
            ? (a.injurySafePace as string)
            : "";
        if (sp) {
          const parts = sp.split(":");
          if (parts.length === 2) setPaceDigits(parts[0] + parts[1]);
        }
        break;
      }
      default:
        break;
    }
  }, [ctx.node, ctx.answers]);

  useEffect(() => {
    if (
      ctx.node === "askCurrentTime" ||
      ctx.node === "askTargetTime" ||
      ctx.node === "askRecent5k" ||
      ctx.node === "askLongestTime"
    ) {
      const el = inputRef.current;
      if (el) {
        const pos = hmsCaretIndex(timeDigits.length);
        requestAnimationFrame(() => {
          el.setSelectionRange(pos, pos);
        });
      }
    }
  }, [timeDigits, ctx.node]);

  useEffect(() => {
    if (ctx.node === "askComfortablePace" || ctx.node === "askSafePace") {
      const el = inputRef.current;
      if (el) {
        const pos = mmssCaretIndex(paceDigits.length);
        requestAnimationFrame(() => {
          el.setSelectionRange(pos, pos);
        });
      }
    }
  }, [paceDigits, ctx.node]);

  const canProceed = useMemo((): boolean => {
    const n = ctx.node;

    if (n === "askName") return text.trim().length > 0;

    if (n === "askAge") {
      const v = Number(numDigits);
      return Number.isFinite(v) && v > 0;
    }

    if (n === "askPrimaryOutcome") {
      const raw = (ctx.answers.primaryOutcome as string) || "";
      const has =
        raw
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0).length > 0;
      return has;
    }

    if (
      n === "askReason" ||
      n === "askGoalKind" ||
      n === "askUnits" ||
      n === "askDistance" ||
      n === "askWindowUnit"
    ) {
      return Boolean(selected);
    }

    if (n === "askRaceDate") {
      const hasDate = dateVal.trim().length > 0;
      const choseLength = selected === "noDate";
      return hasDate || choseLength;
    }

    if (
      n === "askHorizonWeeks" ||
      n === "askHorizonMonths" ||
      n === "askHours" ||
      n === "askMileage" ||
      n === "askSafeDistance"
    ) {
      const v = Number(numDigits);
      return Number.isFinite(v) && v > 0;
    }

    if (
      n === "askCurrentTime" ||
      n === "askTargetTime" ||
      n === "askRecent5k"
    ) {
      const full = digitsToHMS(timeDigits);
      return Boolean(full) || selected === "skip";
    }

    if (n === "askComfortablePace" || n === "askSafePace") {
      const full = digitsToMMSS(paceDigits);
      return Boolean(full) || selected === "skip";
    }

    if (n === "askLongestTime") {
      const full = digitsToHMS(timeDigits);
      return Boolean(full) || selected === "skip";
    }

    if (n === "askInjuries") {
      const injuriesRaw = (ctx.answers.injuries as string) || "";
      const hasInjuryAny =
        injuriesRaw
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0).length > 0;
      const medicalRaw = (ctx.answers.medicalConditions as string) || "";
      const hasMedicalAny =
        medicalRaw
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0).length > 0;
      return hasInjuryAny || hasMedicalAny;
    }

    if (n === "askAddOns") {
      const s = (ctx.answers.includeStrength as string) === "yes";
      const m = (ctx.answers.includeMobility as string) === "yes";
      const skipped = (ctx.answers.addOnsSkipped as string) === "yes";
      return s || m || skipped;
    }

    if (n === "confirm") return false;

    return false;
  }, [
    ctx.node,
    selected,
    text,
    dateVal,
    numDigits,
    timeDigits,
    paceDigits,
    ctx.answers,
  ]);

  function submitNext(): void {
    const n = ctx.node;
    if (n === "askName") {
      ctx.sendText(text.trim());
      return;
    }
    if (n === "askPrimaryOutcome") {
      ctx.sendOption("primaryOutcomeProceed");
      return;
    }
    if (
      n === "askReason" ||
      n === "askGoalKind" ||
      n === "askUnits" ||
      n === "askDistance" ||
      n === "askWindowUnit"
    ) {
      if (selected) ctx.sendOption(selected);
      return;
    }
    if (n === "askRaceDate") {
      if (selected === "noDate") {
        ctx.sendOption("noDate");
        return;
      }
      if (dateVal) {
        ctx.sendDate(dateVal);
        return;
      }
      return;
    }
    if (
      n === "askAge" ||
      n === "askHorizonWeeks" ||
      n === "askHorizonMonths" ||
      n === "askHours" ||
      n === "askMileage" ||
      n === "askSafeDistance"
    ) {
      ctx.sendText(numDigits);
      return;
    }
    if (
      n === "askCurrentTime" ||
      n === "askTargetTime" ||
      n === "askRecent5k"
    ) {
      if (selected === "skip") {
        ctx.sendOption("skip");
        return;
      }
      const full = digitsToHMS(timeDigits);
      if (full) ctx.sendText(full);
      return;
    }
    if (n === "askComfortablePace" || n === "askSafePace") {
      if (selected === "skip") {
        ctx.sendOption("skip");
        return;
      }
      const full = digitsToMMSS(paceDigits);
      if (full) ctx.sendText(full);
      return;
    }
    if (n === "askLongestTime") {
      if (selected === "skip") {
        ctx.sendOption("skip");
        return;
      }
      const full = digitsToHMS(timeDigits);
      if (full) ctx.sendText(full);
      return;
    }
    if (n === "askInjuries") {
      ctx.sendOption("injuriesDone");
      return;
    }
    if (n === "askAddOns") {
      const s = (ctx.answers.includeStrength as string) === "yes";
      const m = (ctx.answers.includeMobility as string) === "yes";
      if (s || m) {
        ctx.sendOption("completeAddOns");
      } else {
        ctx.sendOption("skipAddOns");
      }
      return;
    }
  }

  const injuriesRaw = ((ctx.answers.injuries as string) || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const medicalRaw = ((ctx.answers.medicalConditions as string) || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const hasNoneInj = injuriesRaw.includes("none");
  const hasOtherInj = injuriesRaw.includes("injury_other");

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-3 sm:px-4">
        <div className="relative mb-4 sm:mb-6">
          <div className="absolute -inset-x-6 -top-6 h-24 bg-gradient-to-r from-amber-300/10 via-cyan-300/10 to-emerald-300/10 blur-2xl rounded-full pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                👟 Coach Kaia
              </span>
              <span className="text-xs text-white/70">
                Adaptive running plans that fit your life
              </span>
            </div>
            <div>
              <button
                type="button"
                aria-label="Reset chat"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
              >
                <RotateCw className="h-4 w-4" />
                Reset
              </button>
              {confirmOpen && (
                <div className="absolute right-0 top-10 z-20 w-80 rounded-2xl border border-white/15 bg-[#0b1026]/95 p-4 backdrop-blur">
                  <div className="text-sm text-white">
                    Reset the conversation?
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    This will restart the chat from the beginning and clear your
                    answers in this flow.
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => setConfirmOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="rounded-xl text-black bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"
                      onClick={() => {
                        ctx.reset();
                        setConfirmOpen(false);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-4">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Hi! I’m Coach Kaia — your AI running coach.
            </h2>
            <p className="mt-1 text-sm sm:text-base text-white/85">
              I use the latest training research to build a plan tailored to
              you—so you get faster, stay healthy, and actually enjoy the
              process.
            </p>
            <p className="mt-1 text-sm sm:text-base text-white/80">
              This takes ~2–3 minutes. You’re in control and can edit anything
              later.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <Card className="relative overflow-hidden rounded-3xl border-indigo-300/15 bg-white/5 ring-1 ring-indigo-400/10 backdrop-blur">
              <CardContent className="p-5 sm:p-8">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div
                  ref={scrollerRef}
                  className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-3"
                >
                  {filteredMessages.map((m) => (
                    <div key={m.id} className="flex justify-start">
                      <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-white/10 text-white">
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {ctx.node === "askInjuries" && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm text-white/80">
                      Select all that apply:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => ctx.sendOption("injury_none")}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs transition",
                          hasNoneInj
                            ? "border-emerald-300 bg-emerald-50/10 text-emerald-200"
                            : "border-white/20 bg-white/10 text-white hover:bg-white/15",
                        ].join(" ")}
                      >
                        None
                      </button>

                      {[
                        { code: "injury_shin", label: "Shin splints" },
                        { code: "injury_knee", label: "Knee pain" },
                        { code: "injury_itb", label: "IT band" },
                        { code: "injury_achilles", label: "Achilles" },
                        { code: "injury_plantar", label: "Plantar fasciitis" },
                        { code: "injury_hip", label: "Hip/glute" },
                        { code: "injury_back", label: "Lower back" },
                      ].map((opt) => {
                        const active =
                          injuriesRaw.includes(opt.code) && !hasNoneInj;
                        return (
                          <button
                            key={opt.code}
                            type="button"
                            onClick={() => ctx.sendOption(opt.code)}
                            className={[
                              "rounded-full border px-3 py-1.5 text-xs transition",
                              active
                                ? "border-emerald-300 bg-emerald-50/10 text-emerald-200"
                                : "border-white/20 bg-white/10 text-white hover:bg-white/15",
                            ].join(" ")}
                          >
                            {opt.label}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => ctx.sendOption("injury_other_toggle")}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs transition",
                          hasOtherInj && !hasNoneInj
                            ? "border-emerald-300 bg-emerald-50/10 text-emerald-200"
                            : "border-white/20 bg-white/10 text-white hover:bg-white/15",
                        ].join(" ")}
                      >
                        Other
                      </button>
                    </div>

                    {hasOtherInj && (
                      <input
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                          ctx.sendText(e.target.value);
                        }}
                        placeholder="Briefly describe (optional)"
                        className="w-full rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                      />
                    )}

                    <div className="mt-2 text-sm text-white/80">
                      Any medical conditions?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { code: "medical_heart", label: "Cardiac/heart" },
                        { code: "medical_hypertension", label: "Hypertension" },
                        { code: "medical_asthma", label: "Asthma/respiratory" },
                        { code: "medical_diabetes", label: "Diabetes" },
                        {
                          code: "medical_pregnancy",
                          label: "Pregnant/postpartum",
                        },
                      ].map((opt) => {
                        const active = medicalRaw.includes(opt.code);
                        return (
                          <button
                            key={opt.code}
                            type="button"
                            onClick={() => ctx.sendOption(opt.code)}
                            className={[
                              "rounded-full border px-3 py-1.5 text-xs transition",
                              active
                                ? "border-emerald-300 bg-emerald-50/10 text-emerald-200"
                                : "border-white/20 bg-white/10 text-white hover:bg-white/15",
                            ].join(" ")}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {medicalRaw.length > 0 && (
                      <div className="mt-2 rounded-xl border border-amber-200/30 bg-amber-100/10 p-3 text-xs text-amber-200">
                        Heads-up: because you’ve reported a medical condition,
                        please seek clearance from a qualified healthcare
                        professional before starting a running program.
                      </div>
                    )}
                  </div>
                )}

                {ctx.quickReplies.length > 0 &&
                  ctx.node !== "confirm" &&
                  !ctx.isComplete &&
                  ctx.node !== "askInjuries" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {ctx.quickReplies.map((r) => {
                        const isAddOns = ctx.node === "askAddOns";
                        const isPrimaryOutcome =
                          ctx.node === "askPrimaryOutcome";

                        const strengthActive =
                          isAddOns && r.value === "addStrength"
                            ? (ctx.answers.includeStrength as string) === "yes"
                            : false;
                        const mobilityActive =
                          isAddOns && r.value === "addMobility"
                            ? (ctx.answers.includeMobility as string) === "yes"
                            : false;
                        const skipActive =
                          isAddOns && r.value === "skipAddOns"
                            ? (ctx.answers.addOnsSkipped as string) === "yes"
                            : false;

                        const primaryRaw = (
                          (ctx.answers.primaryOutcome as string) || ""
                        )
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        const primaryActive =
                          isPrimaryOutcome && primaryRaw.includes(r.value);

                        const active = isAddOns
                          ? strengthActive || mobilityActive || skipActive
                          : isPrimaryOutcome
                          ? primaryActive
                          : selected === r.value;

                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => {
                              if (ctx.node === "askAddOns") {
                                ctx.sendOption(r.value);
                                return;
                              }
                              if (ctx.node === "askPrimaryOutcome") {
                                ctx.sendOption(r.value);
                                return;
                              }
                              setSelected(r.value);
                              if (ctx.node === "askRaceDate") {
                                if (r.value === "noDate") setDateVal("");
                              }
                              if (
                                ctx.node === "askHorizonWeeks" ||
                                ctx.node === "askHorizonMonths" ||
                                ctx.node === "askHours" ||
                                ctx.node === "askMileage"
                              ) {
                                if (/^\d+$/.test(r.value)) {
                                  setNumDigits(r.value);
                                } else {
                                  setNumDigits("");
                                }
                              }
                              if (
                                ctx.node === "askCurrentTime" ||
                                ctx.node === "askTargetTime" ||
                                ctx.node === "askRecent5k" ||
                                ctx.node === "askLongestTime"
                              ) {
                                if (r.value === "skip") setTimeDigits("");
                              }
                              if (
                                ctx.node === "askComfortablePace" ||
                                ctx.node === "askSafePace"
                              ) {
                                if (r.value === "skip") setPaceDigits("");
                              }
                            }}
                            className={[
                              "rounded-full border px-3 py-1.5 text-xs transition",
                              active
                                ? "border-emerald-300 bg-emerald-50/10 text-emerald-200"
                                : "border-white/20 bg-white/10 text-white hover:bg-white/15",
                            ].join(" ")}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                <div className="mt-5 flex items-stretch gap-2">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={ctx.goBackOne}
                    className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
                    title="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {ctx.node === "askRaceDate" ? (
                    <input
                      type="date"
                      value={dateVal}
                      onChange={(e) => {
                        if (selected === "noDate") setSelected(null);
                        setDateVal(e.target.value);
                      }}
                      min={new Date().toISOString().slice(0, 10)}
                      className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white outline-none focus:border-indigo-400/40"
                    />
                  ) : ctx.node === "askCurrentTime" ||
                    ctx.node === "askTargetTime" ||
                    ctx.node === "askRecent5k" ||
                    ctx.node === "askLongestTime" ? (
                    <input
                      ref={inputRef}
                      value={formatHMSFromDigits(timeDigits)}
                      onChange={(e) => {
                        if (selected === "skip") setSelected(null);
                        setTimeDigits(
                          e.target.value.replace(/\D+/g, "").slice(0, 6)
                        );
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const el = inputRef.current;
                        if (el) {
                          el.focus();
                          const pos = hmsCaretIndex(timeDigits.length);
                          el.setSelectionRange(pos, pos);
                        }
                      }}
                      onFocus={() => {
                        const el = inputRef.current;
                        if (el) {
                          const pos = hmsCaretIndex(timeDigits.length);
                          el.setSelectionRange(pos, pos);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!/[0-9]|Backspace|Delete|Tab|Enter/.test(e.key)) {
                          e.preventDefault();
                        }
                        if (e.key === "Enter" && canProceed) submitNext();
                      }}
                      placeholder="HH:MM:SS"
                      className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                    />
                  ) : ctx.node === "askComfortablePace" ||
                    ctx.node === "askSafePace" ? (
                    <input
                      ref={inputRef}
                      value={formatMMSSFromDigits(paceDigits)}
                      onChange={(e) => {
                        if (selected === "skip") setSelected(null);
                        setPaceDigits(
                          e.target.value.replace(/\D+/g, "").slice(0, 4)
                        );
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const el = inputRef.current;
                        if (el) {
                          el.focus();
                          const pos = mmssCaretIndex(paceDigits.length);
                          el.setSelectionRange(pos, pos);
                        }
                      }}
                      onFocus={() => {
                        const el = inputRef.current;
                        if (el) {
                          const pos = mmssCaretIndex(paceDigits.length);
                          el.setSelectionRange(pos, pos);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!/[0-9]|Backspace|Delete|Tab|Enter/.test(e.key)) {
                          e.preventDefault();
                        }
                        if (e.key === "Enter" && canProceed) submitNext();
                      }}
                      placeholder="MM:SS"
                      className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                    />
                  ) : ctx.node === "askAge" ||
                    ctx.node === "askHorizonWeeks" ||
                    ctx.node === "askHorizonMonths" ||
                    ctx.node === "askHours" ||
                    ctx.node === "askMileage" ||
                    ctx.node === "askSafeDistance" ? (
                    <input
                      value={numDigits}
                      onChange={(e) => {
                        if (selected) setSelected(null);
                        setNumDigits(e.target.value.replace(/\D+/g, ""));
                      }}
                      onKeyDown={(e) => {
                        if (!/[0-9]|Backspace|Delete|Tab|Enter/.test(e.key)) {
                          e.preventDefault();
                        }
                        if (e.key === "Enter" && canProceed) submitNext();
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                    />
                  ) : ctx.node === "askInjuries" ? (
                    <div className="min-w-0 flex-1" />
                  ) : (
                    <input
                      value={text}
                      onChange={(e) => {
                        if (
                          (ctx.node === "askWindowUnit" ||
                            ctx.node === "askReason" ||
                            ctx.node === "askGoalKind" ||
                            ctx.node === "askUnits" ||
                            ctx.node === "askDistance") &&
                          selected
                        ) {
                          setSelected(null);
                        }
                        setText(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && canProceed) submitNext();
                      }}
                      placeholder="Type your answer…"
                      className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                    />
                  )}

                  <button
                    type="button"
                    disabled={!canProceed}
                    onClick={submitNext}
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-semibold",
                      !canProceed
                        ? "bg-white/10 text-white/60 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black",
                    ].join(" ")}
                  >
                    Next
                  </button>
                </div>

                {ctx.node === "confirm" && !ctx.isComplete && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {ctx.quickReplies.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => ctx.sendOption(r.value)}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}

                {ctx.isComplete && (
                  <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-cyan-400/10 to-emerald-400/10 p-5">
                    <div className="text-lg font-semibold text-white">
                      Your AI-tuned week is nearly ready 🎉
                    </div>
                    <div className="mt-2 text-sm text-white/80">
                      Get a plan that adapts to your life and goals — nothing
                      generic.
                    </div>
                    <ul className="mt-3 space-y-1.5 text-sm text-white/80">
                      <li>• Personalised paces for every run</li>
                      <li>• Work:recovery perfectly tuned for your goal</li>
                      <li>• Smart tapering and milestone checks</li>
                      <li>• One-tap calendar export</li>
                    </ul>
                    <div className="mt-2 text-[11px] text-white/60">
                      No spam — we’ll save your setup so you can tweak it
                      anytime.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <Card className="rounded-3xl border-indigo-300/15 bg-white/5 ring-1 ring-indigo-400/10 backdrop-blur">
              <CardContent className="p-5 sm:p-6">
                <div className="text-sm font-semibold text-white">
                  Your week preview (locked)
                </div>
                <div className="mt-2 text-xs text-white/70">
                  A glimpse of what we’re building for you.
                </div>
                <div className="mt-4 space-y-3 transition blur-sm select-none pointer-events-none">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/70">Mon — Easy Run</div>
                    <div className="text-sm text-white">40 min • Easy</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/70">Wed — Tempo</div>
                    <div className="text-sm text-white">3 × 8 min • Tempo</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/70">Sat — Long Run</div>
                    <div className="text-sm text-white">90 min • Steady</div>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-white/60">
                  Unlocks after setup — tailored paces & recovery included.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
