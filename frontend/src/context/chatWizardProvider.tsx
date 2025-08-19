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

/** Merge Partial<Answers> into Answers without carrying over `undefined` values. */
function mergeAnswers(base: Answers, delta: Partial<Answers>): Answers {
  const out: Answers = { ...base };
  for (const [k, v] of Object.entries(delta)) {
    if (v !== undefined) {
      out[k] = v as string | number;
    }
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
    case "askHours":
      return "How many hours per week can you run?";
    case "askMileage":
      return `What’s your current weekly distance (in ${units})? Just the number.`;
    case "askLongestTime":
      return "Longest continuous run in the last 4–6 weeks? (or Skip).";
    case "confirm":
      return "Here’s what I’ve got:";
    default:
      return "";
  }
}

function repliesForNode(node: Node): Reply[] {
  if (node === "askReason") {
    return [
      { label: "Race or time goal", value: "raceOrTime" },
      { label: "Build distance", value: "distance" },
      { label: "Health / habit", value: "health" },
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
  if (node === "confirm") {
    return [{ label: "Looks good", value: "ok" }];
  }
  return [];
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
      text:
        "Hi! I’m Coach Kaia — your AI running coach. " +
        "I’ll build you a smart, adaptive plan that fits your time, fitness, and goal.",
      ts: Date.now(),
    },
    {
      id: uid(),
      author: "bot",
      text: "We’ll move fast and keep it simple. First things first — what’s your name?",
      ts: Date.now() + 1,
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
  }, [node, answers]);

  const ask = useCallback(
    (nextNode: Node, answerKeys: string[], overrides?: Partial<Answers>) => {
      const merged = overrides ? mergeAnswers(answers, overrides) : answers;
      const prompt = promptForNode(nextNode, merged);
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
        text:
          "Hi! I’m Coach Kaia — your AI running coach. " +
          "I’ll build you a smart, adaptive plan that fits your time, fitness, and goal.",
        ts: Date.now(),
      },
      {
        id: uid(),
        author: "bot",
        text: "We’ll move fast and keep it simple. First things first — what’s your name?",
        ts: Date.now() + 1,
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
      if (node === "askReason") {
        setAnswers((a) => ({ ...a, reason: value }));
        ask("askUnits", ["reason"]);
        return;
      }

      if (node === "askUnits") {
        setAnswers((a) => ({ ...a, units: value }));
        ask("askDistance", ["units"]);
        return;
      }

      if (node === "askDistance") {
        setAnswers((a) => ({ ...a, raceDistance: value }));
        ask("askRaceDate", ["raceDistance"]);
        return;
      }

      if (node === "askRaceDate") {
        if (value === "noDate") {
          setAnswers((a) => {
            const next: Answers = { ...a };
            delete next["raceDate"];
            next["raceDateChoice"] = "noDate";
            return next;
          });
          ask("askWindowUnit", []);
        }
        return;
      }

      if (node === "askWindowUnit") {
        if (value === "weeks") {
          setAnswers((a) => {
            const n: Answers = { ...a };
            delete n["goalHorizonMonths"];
            return n;
          });
          ask("askHorizonWeeks", []);
          return;
        }
        if (value === "months") {
          setAnswers((a) => {
            const n: Answers = { ...a };
            delete n["goalHorizonWeeks"];
            return n;
          });
          ask("askHorizonMonths", []);
          return;
        }
      }

      if (node === "askCurrentTime") {
        if (value === "skip") {
          setAnswers((a) => ({ ...a, askCurrentTimeSkipped: "yes" }));
          ask("askRecent5k", []);
        }
        return;
      }

      if (node === "askTargetTime") {
        if (value === "skip") {
          setAnswers((a) => ({ ...a, askTargetTimeSkipped: "yes" }));
          ask("askHours", []);
        }
        return;
      }

      if (node === "askRecent5k") {
        if (value === "skip") {
          setAnswers((a) => ({ ...a, askRecent5kSkipped: "yes" }));
          ask("askComfortablePace", []);
        }
        return;
      }

      if (node === "askComfortablePace") {
        if (value === "skip") {
          setAnswers((a) => ({ ...a, askComfortablePaceSkipped: "yes" }));
          ask("askHours", []);
        }
        return;
      }

      if (node === "askLongestTime") {
        if (value === "skip") {
          setAnswers((a) => ({ ...a, askLongestTimeSkipped: "yes" }));
          const lines = summaryParagraph(answers);
          setMessages([
            {
              id: uid(),
              author: "bot",
              text: "Here’s what I’ve got:",
              ts: Date.now(),
            },
            { id: uid(), author: "bot", text: lines, ts: Date.now() },
            {
              id: uid(),
              author: "bot",
              text: "Would you like us to include strength to your plan:",
              ts: Date.now() + 1,
            },
          ]);
          setNode("confirm");
          setHistory((h) => [...h, { node: "confirm", answerKeys: [] }]);
          setIsComplete(false);
        }
        return;
      }

      if (node === "confirm") {
        // Inline follow-ups for strength/mobility inside confirm chat
        if (value === "strengthYes" || value === "strengthSkip") {
          const v = value === "strengthYes" ? "yes" : "no";
          setAnswers((a) => ({ ...a, includeStrength: v }));
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              author: "bot",
              text: "Would you like us to include mobility to your plan:",
              ts: Date.now(),
            },
          ]);
          return;
        }
        if (value === "mobilityYes" || value === "mobilitySkip") {
          const v = value === "mobilityYes" ? "yes" : "no";
          setAnswers((a) => ({ ...a, includeMobility: v }));
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              author: "bot",
              text: "Great, we've added that. If you’d like to edit anything, use the back arrow to jump to that step. Otherwise, press “Looks good”.",
              ts: Date.now(),
            },
          ]);
          return;
        }
        if (value === "ok") {
          setIsComplete(true);
        }
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
      ask("askCurrentTime", ["raceDate"]);
    },
    [ask, node, answers]
  );

  const sendText = useCallback(
    (raw?: string) => {
      const text = (raw ?? "").trim();
      if (!text) return;

      if (node === "askName") {
        const first = text.split(/\s+/)[0] || "Runner";
        setAnswers((a) => ({
          ...a,
          name: first,
        }));
        ask("askReason", ["name"], { name: first });
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
          ask("askCurrentTime", ["goalHorizonWeeks"]);
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
          ask("askCurrentTime", ["goalHorizonMonths"]);
        }
        return;
      }

      if (node === "askCurrentTime") {
        setAnswers((a) => {
          const next: Answers = { ...a, currentFitnessTime: text };
          delete next["askCurrentTimeSkipped"];
          return next;
        });
        ask("askTargetTime", ["currentFitnessTime"]);
        return;
      }

      if (node === "askTargetTime") {
        setAnswers((a) => {
          const next: Answers = { ...a, targetTime: text };
          delete next["askTargetTimeSkipped"];
          return next;
        });
        ask("askHours", ["targetTime"]);
        return;
      }

      if (node === "askRecent5k") {
        setAnswers((a) => {
          const next: Answers = { ...a, recent5kTime: text };
          delete next["askRecent5kSkipped"];
          return next;
        });
        ask("askHours", ["recent5kTime"]);
        return;
      }

      if (node === "askComfortablePace") {
        setAnswers((a) => {
          const next: Answers = { ...a, comfortablePace: text };
          delete next["askComfortablePaceSkipped"];
          return next;
        });
        ask("askHours", ["comfortablePace"]);
        return;
      }

      if (node === "askHours") {
        const n = Number(text);
        if (Number.isFinite(n) && n >= 0) {
          setAnswers((a) => ({ ...a, hours: Math.round(n) }));
          ask("askMileage", ["hours"]);
        }
        return;
      }

      if (node === "askMileage") {
        const n = Number(text);
        if (Number.isFinite(n) && n >= 0) {
          setAnswers((a) => ({ ...a, currentMileage: Math.round(n) }));
          ask("askLongestTime", ["currentMileage"]);
        }
        return;
      }

      if (node === "askLongestTime") {
        setAnswers((a) => {
          const next: Answers = { ...a, longestRunTime: text };
          delete next["askLongestTimeSkipped"];
          return next;
        });
        const lines = summaryParagraph({ ...answers, longestRunTime: text });
        setMessages([
          {
            id: uid(),
            author: "bot",
            text: "Here’s what I’ve got:",
            ts: Date.now(),
          },
          { id: uid(), author: "bot", text: lines, ts: Date.now() },
          {
            id: uid(),
            author: "bot",
            text: "Would you like us to include strength to your plan:",
            ts: Date.now() + 1,
          },
        ]);
        setNode("confirm");
        setHistory((h) => [...h, { node: "confirm", answerKeys: [] }]);
        setIsComplete(false);
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
