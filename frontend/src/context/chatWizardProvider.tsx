import { useCallback, useEffect, useMemo, useState } from "react";
import ChatWizardContext, {
  type ChatMessage,
  type Reply,
  type Node,
  type ChatWizardContextValue,
  type Answers,
} from "@/context/chatWizardContext";

function uid(): string {
  return Math.random().toString(36).slice(2);
}

function fmtDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addWeeks(from: Date, w: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + Math.round(w) * 7);
  return d;
}

function addMonths(from: Date, m: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + Math.round(m));
  return d;
}

function weeksBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24 * 7)));
}

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
}

type Step = { node: Node; answerKeys: string[] };

function mergeAnswers(base: Answers, delta?: Partial<Answers>): Answers {
  if (!delta) return base;
  const out: Answers = { ...base };
  for (const [k, v] of Object.entries(delta)) {
    if (v !== undefined) out[k] = v as string | number;
  }
  return out;
}

function promptForNode(node: Node, answers: Answers): string {
  const name = (answers["name"] as string) || "";
  const units = (answers["units"] as string) || "km";
  switch (node) {
    case "askName":
      return "Hi! I’m Coach Kaia — your AI running coach. What’s your name?";
    case "askReason":
      return `Nice to meet you, ${name}. What brings you to Runzi today?`;
    case "askAge":
      return "How old are you?";
    case "askGoalKind":
      return "What kind of goal are we working with?";
    case "askPrimaryOutcome":
      return "What do you most want from your running right now?";
    case "askUnits":
      return "Which units do you prefer?";
    case "askDistance":
      return "Great — what distance are we targeting?";
    case "askRaceDate":
      return "Are you training for a race with a set date (that will be your plan length), or would you rather choose a plan length yourself?";
    case "askWindowUnit":
      return "Should we frame your plan in weeks or months?";
    case "askHorizonWeeks":
      return "How many weeks do you want to train?";
    case "askHorizonMonths":
      return "How many months do you want to train?";
    case "askCurrentTime":
      return "If you raced that distance today, what time would you run? (or Skip).";
    case "askTargetTime":
      return "What’s your goal time? (or Skip).";
    case "askRecent5k":
      return "Do you know your most recent 5K time? (or Skip).";
    case "askComfortablePace":
      return `Roughly what’s your typical easy pace per ${
        units === "mi" ? "mile" : "km"
      }? (or Skip).`;
    case "askSafeDistance":
      return `Injury-safe baseline: what distance can you comfortably run now without aggravation? (just the number, in ${units})`;
    case "askSafePace":
      return `Injury-safe baseline: what easy pace per ${
        units === "mi" ? "mile" : "km"
      } can you run now without aggravation? (MM:SS)`;
    case "askHours":
      return "About how many total hours per week can you train (including any strength or mobility you plan to do)?";
    case "askMileage":
      return `What’s your current weekly distance (in ${units})? Just the number.`;
    case "askLongestTime":
      return "Longest continuous run in the last 4–6 weeks? (or Skip).";
    case "askInjuries":
      return "Any injuries or medical conditions we should factor in?";
    case "askAddOns":
      return "Would you like us to include strength or mobility to your plan?";
    case "confirm":
      return "Here’s what I’ve got:";
    default:
      return "";
  }
}

function repliesForNode(node: Node): Reply[] {
  if (node === "askReason") {
    return [
      { label: "Race, time or distance goal", value: "rtd" },
      { label: "Health / habit", value: "health" },
    ];
  }
  if (node === "askGoalKind") {
    return [
      { label: "Race with a set date", value: "race" },
      { label: "Time goal for a distance", value: "time" },
      { label: "Build up to a distance (no race)", value: "distance" },
    ];
  }
  if (node === "askPrimaryOutcome") {
    return [
      { label: "Consistency", value: "consistency" },
      { label: "General fitness", value: "fitness" },
      { label: "Weight management", value: "weight" },
      { label: "Stress relief", value: "stress" },
      { label: "Return to running", value: "return" },
    ];
  }
  if (node === "askUnits") {
    return [
      { label: "Kilometres (km)", value: "km" },
      { label: "Miles (mi)", value: "mi" },
    ];
  }
  if (node === "askDistance") {
    return [
      { label: "5K", value: "5k" },
      { label: "10K", value: "10k" },
      { label: "Half Marathon", value: "half" },
      { label: "Marathon", value: "marathon" },
      { label: "Ultra", value: "ultra" },
    ];
  }
  if (node === "askRaceDate") {
    return [{ label: "Choose plan length instead", value: "noDate" }];
  }
  if (node === "askWindowUnit") {
    return [
      { label: "Weeks", value: "weeks" },
      { label: "Months", value: "months" },
    ];
  }
  if (node === "askHorizonWeeks") {
    return [
      { label: "6", value: "6" },
      { label: "8", value: "8" },
      { label: "10", value: "10" },
      { label: "12", value: "12" },
      { label: "16", value: "16" },
      { label: "20", value: "20" },
    ];
  }
  if (node === "askHorizonMonths") {
    return [
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "6", value: "6" },
      { label: "9", value: "9" },
      { label: "12", value: "12" },
    ];
  }
  if (
    node === "askCurrentTime" ||
    node === "askTargetTime" ||
    node === "askRecent5k" ||
    node === "askComfortablePace" ||
    node === "askLongestTime"
  ) {
    return [{ label: "Skip", value: "skip" }];
  }
  if (node === "askHours") {
    return [
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "5", value: "5" },
      { label: "6", value: "6" },
      { label: "8", value: "8" },
      { label: "10", value: "10" },
      { label: "12", value: "12" },
      { label: "15", value: "15" },
      { label: "20", value: "20" },
    ];
  }
  if (node === "askAddOns") {
    return [
      { label: "Strength", value: "addStrength" },
      { label: "Mobility", value: "addMobility" },
      { label: "Skip", value: "skipAddOns" },
    ];
  }
  if (node === "confirm") {
    return [{ label: "Looks good", value: "ok" }];
  }
  return [];
}

function labelForMedical(code: string): string {
  switch (code) {
    case "medical_heart":
      return "heart/cardiac condition";
    case "medical_hypertension":
      return "hypertension";
    case "medical_asthma":
      return "asthma/respiratory condition";
    case "medical_diabetes":
      return "diabetes";
    case "medical_pregnancy":
      return "pregnant/postpartum";
    default:
      return code;
  }
}

function summaryParagraph(answers: Answers): string {
  const name = (answers["name"] as string) || "Runner";
  const dist = (answers["raceDistance"] as string) || "";
  const units = (answers["units"] as string) || "km";
  const current = (answers["currentFitnessTime"] as string) || "";
  const goal = (answers["targetTime"] as string) || "";
  const hours = answers["hours"];
  const weekly = answers["currentMileage"];
  const raceISO = answers["raceDate"] as string | undefined;
  const weeks = answers["goalHorizonWeeks"]
    ? Number(answers["goalHorizonWeeks"])
    : undefined;
  const months = answers["goalHorizonMonths"]
    ? Number(answers["goalHorizonMonths"])
    : undefined;
  const wantStrength = answers["includeStrength"] === "yes";
  const wantMobility = answers["includeMobility"] === "yes";
  const start = today();
  const parts: string[] = [];
  parts.push(`${name}, here’s what I have so far.`);
  if (dist) parts.push(`You’re focusing on the ${dist}.`);
  if (current) parts.push(`Right now you’d expect around ${current}.`);
  if (goal) parts.push(`You’d like to target about ${goal}.`);
  if (typeof hours === "number")
    parts.push(`You can train ~${hours} hours per week.`);
  if (typeof weekly === "number")
    parts.push(`Your current weekly distance is ~${weekly} ${units}.`);
  if (raceISO) {
    const race = new Date(raceISO);
    const w = weeksBetween(start, race);
    parts.push(
      `Your race is on ${fmtDate(race)} (about ${w} weeks from ${fmtDate(
        start
      )}).`
    );
  } else if (typeof weeks === "number") {
    const end = addWeeks(start, weeks);
    parts.push(`You chose a ${weeks}-week plan ending around ${fmtDate(end)}.`);
  } else if (typeof months === "number") {
    const end = addMonths(start, months);
    const approxWeeks = Math.round(months * 4.345);
    parts.push(
      `You chose a ${months}-month plan (~${approxWeeks} weeks), ending around ${fmtDate(
        end
      )}.`
    );
  }
  if (wantStrength && wantMobility) {
    parts.push("You’d like to include strength and mobility in your plan.");
  } else if (wantStrength) {
    parts.push("You’d like to include strength in your plan.");
  } else if (wantMobility) {
    parts.push("You’d like to include mobility in your plan.");
  }
  const medicalRaw = (answers["medicalConditions"] as string) || "";
  if (medicalRaw.trim().length > 0) {
    const meds = medicalRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(labelForMedical);
    if (meds.length > 0) {
      if (answers["medicalClearance"] === "confirmed") {
        parts.push(
          `You reported ${meds.join(
            ", "
          )} and confirmed you’re cleared to exercise.`
        );
      } else {
        parts.push(
          `You reported ${meds.join(
            ", "
          )}. We’ll keep things conservative; consider medical clearance before intensity.`
        );
      }
    }
  }
  parts.push(
    "If you’d like to edit anything, use the back arrow to jump to that step. Otherwise, press “Looks good”."
  );
  return parts.join(" ");
}

export default function ChatWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      author: "bot",
      text: "Hi! I’m Coach Kaia — your AI running coach. I’ll tune paces and recovery so you improve without burnout.",
      ts: Date.now(),
    },
    {
      id: uid(),
      author: "bot",
      text: "This takes ~2–3 minutes. You’re in control and can edit anything later.",
      ts: Date.now() + 1,
    },
    {
      id: uid(),
      author: "bot",
      text: "What’s your name?",
      ts: Date.now() + 2,
    },
  ]);

  const [node, setNode] = useState<Node>("askName");
  const [answers, setAnswers] = useState<Answers>({});
  const [quickReplies, setQuickReplies] = useState<Reply[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [, setHistory] = useState<Step[]>([
    { node: "askName", answerKeys: [] },
  ]);

  useEffect(() => {
    setQuickReplies(repliesForNode(node));
  }, [node]);

  useEffect(() => {
    const handle = (e: BeforeUnloadEvent) => {
      if (node !== "askName" || Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, [node, answers]);

  const ask = useCallback(
    (nextNode: Node, answerKeys: string[], overrides?: Partial<Answers>) => {
      const prompt = promptForNode(nextNode, mergeAnswers(answers, overrides));
      const botMsg: ChatMessage = {
        id: uid(),
        author: "bot",
        text: prompt,
        ts: Date.now(),
      };
      setMessages([botMsg]);
      setNode(nextNode);
      setIsComplete(false);
      setHistory((h) => [...h, { node: nextNode, answerKeys }]);
    },
    [answers]
  );

  const goBackOne = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const prev = h[h.length - 2];
      const trimmed = h.slice(0, h.length - 1);
      const prevPrompt = promptForNode(prev.node, answers);
      setMessages([
        { id: uid(), author: "bot", text: prevPrompt, ts: Date.now() },
      ]);
      setNode(prev.node);
      setIsComplete(false);
      return trimmed;
    });
  }, [answers]);

  const reset = useCallback(() => {
    const first: ChatMessage[] = [
      {
        id: uid(),
        author: "bot",
        text: "Hi! I’m Coach Kaia — your AI running coach. I’ll tune paces and recovery so you improve without burnout.",
        ts: Date.now(),
      },
      {
        id: uid(),
        author: "bot",
        text: "This takes ~2–3 minutes. You’re in control and can edit anything later.",
        ts: Date.now() + 1,
      },
      {
        id: uid(),
        author: "bot",
        text: "What’s your name?",
        ts: Date.now() + 2,
      },
    ];
    setMessages(first);
    setNode("askName");
    setAnswers({});
    setIsComplete(false);
    setHistory([{ node: "askName", answerKeys: [] }]);
  }, []);

  const sendOption = useCallback(
    (value: string) => {
      if (node === "askPrimaryOutcome") {
        if (value === "primaryOutcomeProceed") {
          ask("askWindowUnit" as Node, ["primaryOutcome"]);
          return;
        }
        setAnswers((a) => {
          const raw = (a["primaryOutcome"] as string) || "";
          const set = new Set(
            raw
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
          );
          if (set.has(value)) set.delete(value);
          else set.add(value);
          return { ...a, primaryOutcome: Array.from(set).join(",") };
        });
        return;
      }

      if (node === "askAddOns") {
        if (value === "addStrength") {
          setAnswers((a) => ({
            ...a,
            includeStrength: a.includeStrength === "yes" ? "no" : "yes",
            addOnsSkipped:
              a.addOnsSkipped === "yes" ? "" : (a.addOnsSkipped as string),
          }));
          return;
        }
        if (value === "addMobility") {
          setAnswers((a) => ({
            ...a,
            includeMobility: a.includeMobility === "yes" ? "no" : "yes",
            addOnsSkipped:
              a.addOnsSkipped === "yes" ? "" : (a.addOnsSkipped as string),
          }));
          return;
        }
        if (value === "skipAddOns") {
          const nextAnswers: Answers = { ...answers, addOnsSkipped: "yes" };
          delete nextAnswers["includeStrength"];
          delete nextAnswers["includeMobility"];
          setAnswers(nextAnswers);
          const lines = summaryParagraph(nextAnswers);
          setMessages([
            {
              id: uid(),
              author: "bot",
              text: "Here’s what I’ve got:",
              ts: Date.now(),
            },
            { id: uid(), author: "bot", text: lines, ts: Date.now() },
          ]);
          setNode("confirm");
          setHistory((h) => [...h, { node: "confirm", answerKeys: [] }]);
          setIsComplete(false);
          return;
        }
        if (value === "completeAddOns") {
          const nextAnswers: Answers = { ...answers };
          if (nextAnswers["addOnsSkipped"] === "yes") {
            delete nextAnswers["addOnsSkipped"];
          }
          setAnswers(nextAnswers);
          const lines = summaryParagraph(nextAnswers);
          setMessages([
            {
              id: uid(),
              author: "bot",
              text: "Here’s what I’ve got:",
              ts: Date.now(),
            },
            { id: uid(), author: "bot", text: lines, ts: Date.now() },
          ]);
          setNode("confirm");
          setHistory((h) => [...h, { node: "confirm", answerKeys: [] }]);
          setIsComplete(false);
          return;
        }
      }

      if (node === "askInjuries") {
        if (value === "injuriesDone") {
          const inj = ((answers["injuries"] as string) || "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .filter((s) => s !== "none");
          const meds = ((answers["medicalConditions"] as string) || "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          if (inj.length > 0 || meds.length > 0) {
            ask("askSafeDistance" as Node, []);
          } else {
            ask("askAddOns" as Node, []);
          }
          return;
        }
        if (value === "injury_none") {
          setAnswers((a) => {
            const n: Answers = { ...a, injuries: "none" };
            return n;
          });
          return;
        }
        if (value.startsWith("injury_") || value.startsWith("medical_")) {
          setAnswers((a) => {
            const isMedical = value.startsWith("medical_");
            const listKey = isMedical ? "medicalConditions" : "injuries";
            const currentRaw = (a[listKey] as string) || "";
            const current = new Set(
              currentRaw
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            );
            if (!isMedical) {
              const injuriesRaw = (a["injuries"] as string) || "";
              const parts = injuriesRaw.split(",").map((s) => s.trim());
              if (parts.includes("none")) current.delete("none");
            } else {
              const injuriesRaw = (a["injuries"] as string) || "";
              const ij = new Set(
                injuriesRaw
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
              );
              if (ij.has("none")) {
                ij.delete("none");
                a["injuries"] = Array.from(ij).join(",");
              }
            }
            if (current.has(value)) current.delete(value);
            else current.add(value);
            const updated = Array.from(current).join(",");
            const n: Answers = { ...a, [listKey]: updated } as Answers;
            if (isMedical && updated.trim().length === 0) {
              n["medicalClearance"] = "";
            }
            return n;
          });
          return;
        }
        if (value === "injury_other_toggle") {
          setAnswers((a) => {
            const raw = (a["injuries"] as string) || "";
            const set = new Set(
              raw
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            );
            if (set.has("injury_other")) set.delete("injury_other");
            else {
              set.delete("none");
              set.add("injury_other");
            }
            return { ...a, injuries: Array.from(set).join(",") };
          });
          return;
        }
        if (value === "medical_clearance_confirm") {
          setAnswers((a) => ({
            ...a,
            medicalClearance:
              a["medicalClearance"] === "confirmed" ? "" : "confirmed",
          }));
          return;
        }
      }

      if (value === "strengthYes" || value === "strengthSkip") {
        const v = value === "strengthYes" ? "yes" : "no";
        setAnswers((a) => ({ ...a, includeStrength: v }));
        return;
      }
      if (value === "mobilityYes" || value === "mobilitySkip") {
        const v = value === "mobilityYes" ? "yes" : "no";
        setAnswers((a) => ({ ...a, includeMobility: v }));
        return;
      }

      if (node === "askReason") {
        setAnswers((a) => ({ ...a, reason: value }));
        ask("askAge" as Node, ["reason"]);
        return;
      }

      if (node === "askUnits") {
        setAnswers((a) => ({ ...a, units: value }));
        const reason = (answers["reason"] as string) || "rtd";
        if (reason === "health") {
          ask("askPrimaryOutcome" as Node, ["units"]);
        } else {
          ask("askGoalKind" as Node, ["units"]);
        }
        return;
      }

      if (node === "askGoalKind") {
        setAnswers((a) => ({ ...a, goalKind: value }));
        ask("askDistance" as Node, ["goalKind"]);
        return;
      }

      if (node === "askDistance") {
        setAnswers((a) => ({ ...a, raceDistance: value }));
        const reason = (answers["reason"] as string) || "rtd";
        const goalKind = (answers["goalKind"] as string) || "race";
        if (reason === "health") {
          ask("askWindowUnit" as Node, ["raceDistance"]);
          return;
        }
        if (goalKind === "race") {
          ask("askRaceDate" as Node, ["raceDistance"]);
          return;
        }
        if (goalKind === "time") {
          ask("askTargetTime" as Node, ["raceDistance"]);
          return;
        }
        if (goalKind === "distance") {
          ask("askWindowUnit" as Node, ["raceDistance"]);
          return;
        }
        return;
      }

      if (node === "askRaceDate") {
        if (value === "noDate") {
          setAnswers((a) => {
            const next: Answers = { ...a };
            delete next["raceDate"];
            delete next["goalHorizonWeeks"];
            delete next["goalHorizonMonths"];
            next["raceDateChoice"] = "noDate";
            return next;
          });
          ask("askWindowUnit" as Node, []);
        }
        return;
      }

      if (node === "askWindowUnit") {
        if (value === "weeks") {
          setAnswers((a) => {
            const n: Answers = { ...a, windowUnit: "weeks" };
            delete n["goalHorizonMonths"];
            return n;
          });
          ask("askHorizonWeeks" as Node, []);
          return;
        }
        if (value === "months") {
          setAnswers((a) => {
            const n: Answers = { ...a, windowUnit: "months" };
            delete n["goalHorizonWeeks"];
            return n;
          });
          ask("askHorizonMonths" as Node, []);
          return;
        }
      }

      if (node === "askCurrentTime" && value === "skip") {
        setAnswers((a) => {
          const n: Answers = { ...a, askCurrentTimeSkipped: "yes" };
          delete n["currentFitnessTime"];
          return n;
        });
        ask("askRecent5k" as Node, []);
        return;
      }

      if (node === "askTargetTime" && value === "skip") {
        setAnswers((a) => {
          const n: Answers = { ...a, askTargetTimeSkipped: "yes" };
          delete n["targetTime"];
          return n;
        });
        ask("askHours" as Node, []);
        return;
      }

      if (node === "askRecent5k" && value === "skip") {
        setAnswers((a) => {
          const n: Answers = { ...a, askRecent5kSkipped: "yes" };
          delete n["recent5kTime"];
          return n;
        });
        ask("askComfortablePace" as Node, []);
        return;
      }

      if (node === "askComfortablePace" && value === "skip") {
        setAnswers((a) => {
          const n: Answers = { ...a, askComfortablePaceSkipped: "yes" };
          delete n["comfortablePace"];
          return n;
        });
        ask("askHours" as Node, []);
        return;
      }

      if (node === "askLongestTime" && value === "skip") {
        setAnswers((a) => {
          const n: Answers = { ...a, askLongestTimeSkipped: "yes" };
          delete n["longestRunTime"];
          return n;
        });
        ask("askInjuries" as Node, []);
        return;
      }

      if (node === "confirm" && value === "ok") {
        setIsComplete(true);
      }
    },
    [ask, node, answers]
  );

  const sendDate = useCallback(
    (iso: string) => {
      if (node !== "askRaceDate") return;
      if (!isISODate(iso)) return;
      const d = new Date(iso);
      const t = today();
      const max = new Date(t);
      max.setFullYear(max.getFullYear() + 3);
      if (d <= t || d > max) {
        const prompt = promptForNode("askRaceDate", answers);
        const hint =
          d <= t
            ? "Please pick a future date (YYYY-MM-DD)."
            : "That’s a bit too far out. Try within ~3 years.";
        setMessages([
          { id: uid(), author: "bot", text: prompt, ts: Date.now() },
          { id: uid(), author: "bot", text: hint, ts: Date.now() + 1 },
        ]);
        return;
      }
      setAnswers((a) => {
        const next: Answers = { ...a };
        delete next["goalHorizonWeeks"];
        delete next["goalHorizonMonths"];
        next["raceDate"] = iso;
        delete next["raceDateChoice"];
        return next;
      });
      ask("askCurrentTime" as Node, ["raceDate"]);
    },
    [ask, node, answers]
  );

  const sendText = useCallback(
    (raw?: string) => {
      const text = (raw ?? "").trim();
      if (!text) return;

      if (node === "askName") {
        const first = text.split(/\s+/)[0] || "Runner";
        setAnswers((a) => ({ ...a, name: first }));
        ask("askReason" as Node, ["name"], { name: first });
        return;
      }

      if (node === "askAge") {
        const n = Number(text);
        if (Number.isFinite(n) && n >= 10 && n <= 100) {
          setAnswers((a) => ({ ...a, age: Math.round(n) }));
          ask("askUnits" as Node, ["age"]);
        }
        return;
      }

      if (node === "askHorizonWeeks") {
        const n = Number(text);
        if (Number.isFinite(n) && n > 0) {
          setAnswers((a) => {
            const next: Answers = { ...a };
            delete next["raceDate"];
            next["goalHorizonWeeks"] = String(Math.round(n));
            return next;
          });
          const reason = (answers["reason"] as string) || "rtd";
          const goalKind = (answers["goalKind"] as string) || "race";
          if (reason === "health") {
            ask("askHours" as Node, ["goalHorizonWeeks"]);
          } else if (goalKind === "distance") {
            ask("askComfortablePace" as Node, ["goalHorizonWeeks"]);
          } else {
            ask("askCurrentTime" as Node, ["goalHorizonWeeks"]);
          }
        }
        return;
      }

      if (node === "askHorizonMonths") {
        const n = Number(text);
        if (Number.isFinite(n) && n > 0) {
          setAnswers((a) => {
            const next: Answers = { ...a };
            delete next["raceDate"];
            next["goalHorizonMonths"] = String(Math.round(n));
            return next;
          });
          const reason = (answers["reason"] as string) || "rtd";
          const goalKind = (answers["goalKind"] as string) || "race";
          if (reason === "health") {
            ask("askHours" as Node, ["goalHorizonMonths"]);
          } else if (goalKind === "distance") {
            ask("askComfortablePace" as Node, ["goalHorizonMonths"]);
          } else {
            ask("askCurrentTime" as Node, ["goalHorizonMonths"]);
          }
        }
        return;
      }

      if (node === "askCurrentTime") {
        setAnswers((a) => {
          const next: Answers = { ...a, currentFitnessTime: text };
          delete next["askCurrentTimeSkipped"];
          return next;
        });
        ask("askTargetTime" as Node, ["currentFitnessTime"]);
        return;
      }

      if (node === "askTargetTime") {
        setAnswers((a) => {
          const next: Answers = { ...a, targetTime: text };
          delete next["askTargetTimeSkipped"];
          return next;
        });
        ask("askHours" as Node, ["targetTime"]);
        return;
      }

      if (node === "askRecent5k") {
        setAnswers((a) => {
          const next: Answers = { ...a, recent5kTime: text };
          delete next["askRecent5kSkipped"];
          return next;
        });
        ask("askHours" as Node, ["recent5kTime"]);
        return;
      }

      if (node === "askComfortablePace") {
        setAnswers((a) => {
          const next: Answers = { ...a, comfortablePace: text };
          delete next["askComfortablePaceSkipped"];
          return next;
        });
        ask("askHours" as Node, ["comfortablePace"]);
        return;
      }

      if (node === "askSafeDistance") {
        const n = Number(text);
        if (Number.isFinite(n) && n >= 0) {
          setAnswers((a) => ({ ...a, safeBaselineDistance: Math.round(n) }));
          ask("askSafePace" as Node, ["safeBaselineDistance"]);
        }
        return;
      }

      if (node === "askSafePace") {
        setAnswers((a) => ({ ...a, safeBaselinePace: text }));
        ask("askAddOns" as Node, ["safeBaselinePace"]);
        return;
      }

      if (node === "askHours") {
        const n = Number(text);
        if (Number.isFinite(n) && n >= 0) {
          setAnswers((a) => ({ ...a, hours: Math.round(n) }));
          ask("askMileage" as Node, ["hours"]);
        }
        return;
      }

      if (node === "askMileage") {
        const n = Number(text);
        if (Number.isFinite(n) && n >= 0) {
          setAnswers((a) => ({ ...a, currentMileage: Math.round(n) }));
          ask("askLongestTime" as Node, ["currentMileage"]);
        }
        return;
      }

      if (node === "askLongestTime") {
        setAnswers((a) => {
          const next: Answers = { ...a, longestRunTime: text };
          delete next["askLongestTimeSkipped"];
          return next;
        });
        ask("askInjuries" as Node, ["longestRunTime"]);
        return;
      }

      if (node === "askAddOns") {
        return;
      }

      if (node === "askInjuries") {
        setAnswers((a) => ({ ...a, injuryOther: text }));
        return;
      }
    },
    [ask, node, answers]
  );

  const ctx: ChatWizardContextValue = useMemo(
    () => ({
      messages,
      quickReplies,
      input: "",
      setInput: () => undefined,
      sendText,
      sendOption,
      sendDate,
      goBackOne,
      reset,
      isComplete,
      startOnMonday: false,
      toggleStartOnMonday: () => undefined,
      node,
      answers,
    }),
    [
      messages,
      quickReplies,
      sendText,
      sendOption,
      sendDate,
      goBackOne,
      reset,
      isComplete,
      node,
      answers,
    ]
  );

  return (
    <ChatWizardContext.Provider value={ctx}>
      {children}
    </ChatWizardContext.Provider>
  );
}
