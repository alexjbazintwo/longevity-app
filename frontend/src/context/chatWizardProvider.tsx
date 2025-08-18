import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChatWizardContext,
} from "@/context/chatWizardContext";
import type {
  ChatMessage,
  Reply,
} from "@/context/chatWizardContext";

type Answers = Record<string, string | number>;
type Node =
  | "askName"
  | "askTargetMode"
  | "askDistance"
  | "askCurrentTime"
  | "askTargetTime"
  | "askRaceDate"
  | "askHorizonWeeks"
  | "askHours"
  | "askMileage"
  | "askLongest"
  | "askRecent5k"
  | "confirm";

const lsPrefix = "chatWizard";
const lsOpen = `${lsPrefix}.open`;
const lsMsgs = `${lsPrefix}.messages`;
const lsNode = `${lsPrefix}.node`;
const lsAns = `${lsPrefix}.answers`;

function uid() {
  return Math.random().toString(36).slice(2);
}

function seedBot(): ChatMessage[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      author: "bot",
      text: "Hi! I’m Coach Kaia. Let’s get your goal dialed in.",
      ts: now,
    },
    { id: uid(), author: "bot", text: "What’s your name?", ts: now + 1 },
  ];
}

function normaliseTime(s: string) {
  const t = s.trim();
  if (!t) return "";
  const parts = t.split(":").map((x) => x.trim());
  if (parts.length === 3) {
    const [H, M, S] = parts;
    const h = String(Math.max(0, Number(H) || 0));
    const m = String(Math.max(0, Math.min(59, Number(M) || 0))).padStart(
      2,
      "0"
    );
    const s2 = String(Math.max(0, Math.min(59, Number(S) || 0))).padStart(
      2,
      "0"
    );
    return `${h}:${m}:${s2}`;
  }
  if (parts.length === 2) {
    const [M, S] = parts;
    const m = String(Math.max(0, Number(M) || 0));
    const s2 = String(Math.max(0, Math.min(59, Number(S) || 0))).padStart(
      2,
      "0"
    );
    return `0:${m.padStart(2, "0")}:${s2}`;
  }
  return "";
}

function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
}

export default function ChatWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatOpen, setChatOpen] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(lsOpen);
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

const [messages, setMessages] = useState<ChatMessage[]>(() => {
  try {
    const raw = localStorage.getItem(lsMsgs);
    if (raw) {
      const arr = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {
    void 0;
  }
  return seedBot();
});


  const [node, setNode] = useState<Node>(() => {
    try {
      const raw = localStorage.getItem(lsNode);
      return (raw as Node) || "askName";
    } catch {
      return "askName";
    }
  });

  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const raw = localStorage.getItem(lsAns);
      return raw ? (JSON.parse(raw) as Answers) : {};
    } catch {
      return {};
    }
  });

  const [input, setInput] = useState("");
  const [quickReplies, setQuickReplies] = useState<Reply[]>(() => {
    if (node === "askTargetMode")
      return [
        { label: "Race date set", value: "race" },
        { label: "Race date TBD", value: "raceTbd" },
        { label: "PR / time-trial", value: "timeTrial" },
      ];
    return [];
  });

  // chatOpen effect
  useEffect(() => {
    try {
      localStorage.setItem(lsOpen, JSON.stringify(chatOpen));
    } catch {
      void 0;
    }
  }, [chatOpen]);

  // messages effect
  useEffect(() => {
    try {
      localStorage.setItem(lsMsgs, JSON.stringify(messages));
    } catch {
      void 0;
    }
  }, [messages]);

  // node effect
  useEffect(() => {
    try {
      localStorage.setItem(lsNode, node);
    } catch {
      void 0;
    }
  }, [node]);

  // answers effect (both try/catch blocks)
  useEffect(() => {
    try {
      localStorage.setItem(lsAns, JSON.stringify(answers));
    } catch {
      void 0;
    }
    try {
      const prev = localStorage.getItem("setupAnswers");
      const merged = prev ? { ...JSON.parse(prev), ...answers } : answers;
      localStorage.setItem("setupAnswers", JSON.stringify(merged));
    } catch {
      void 0;
    }
  }, [answers]);

  const push = useCallback((m: ChatMessage | ChatMessage[]) => {
    const arr = Array.isArray(m) ? m : [m];
    setMessages((cur) => cur.concat(arr));
  }, []);

  const botSay = useCallback(
    (text: string) => {
      push({ id: uid(), author: "bot", text, ts: Date.now() });
    },
    [push]
  );

  const setReplies = useCallback((items: Reply[]) => {
    setQuickReplies(items);
  }, []);

  const nextTargetMode = useCallback(
    (name: string) => {
      botSay(
        `Nice to meet you, ${name}. Are you training for a set race date, a race with date TBD, or just a PR/time-trial?`
      );
      setReplies([
        { label: "Race date set", value: "race" },
        { label: "Race date TBD", value: "raceTbd" },
        { label: "PR / time-trial", value: "timeTrial" },
      ]);
      setNode("askTargetMode");
    },
    [botSay, setReplies]
  );

  const nextDistance = useCallback(() => {
    botSay("Great. What distance are we targeting?");
    setReplies([
      { label: "5K", value: "5k" },
      { label: "10K", value: "10k" },
      { label: "Half Marathon", value: "half" },
      { label: "Marathon", value: "marathon" },
      { label: "Ultra", value: "ultra" },
    ]);
    setNode("askDistance");
  }, [botSay, setReplies]);

  const nextCurrentTime = useCallback(() => {
    botSay(
      "If you raced this distance today, what time would you run? Use HH:MM:SS or MM:SS."
    );
    setReplies([]);
    setNode("askCurrentTime");
  }, [botSay, setReplies]);

  const nextTargetTime = useCallback(() => {
    botSay("What’s your goal time? You can type Skip to continue.");
    setReplies([{ label: "Skip", value: "skip" }]);
    setNode("askTargetTime");
  }, [botSay, setReplies]);

  const nextRaceDateOrWindow = useCallback(
    (mode: string) => {
      if (mode === "race") {
        botSay("What’s the race date? Use YYYY-MM-DD.");
        setReplies([]);
        setNode("askRaceDate");
      } else {
        botSay(
          "What training window are you thinking, in weeks? For example: 10"
        );
        setReplies([
          { label: "6", value: "6" },
          { label: "8", value: "8" },
          { label: "10", value: "10" },
          { label: "12", value: "12" },
        ]);
        setNode("askHorizonWeeks");
      }
    },
    [botSay, setReplies]
  );

  const nextHours = useCallback(() => {
    botSay("How many hours per week can you run?");
    setReplies([
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "5", value: "5" },
      { label: "6", value: "6" },
      { label: "8", value: "8" },
      { label: "10", value: "10" },
    ]);
    setNode("askHours");
  }, [botSay, setReplies]);

  const nextMileage = useCallback(() => {
    botSay("What’s your current weekly distance? Enter a number.");
    setReplies([]);
    setNode("askMileage");
  }, [botSay, setReplies]);

  const nextLongest = useCallback(() => {
    botSay("Longest continuous run in the last 4–6 weeks? You can type Skip.");
    setReplies([{ label: "Skip", value: "skip" }]);
    setNode("askLongest");
  }, [botSay, setReplies]);

  const nextRecent5k = useCallback(() => {
    botSay("Most recent 5K time? You can type Skip.");
    setReplies([{ label: "Skip", value: "skip" }]);
    setNode("askRecent5k");
  }, [botSay, setReplies]);

  const nextConfirm = useCallback(() => {
    const name = (answers["name"] as string) || "Runner";
    const mode = answers["targetMode"];
    const dist = answers["raceDistance"];
    const cur = answers["currentFitnessTime"];
    const goal = answers["targetTime"];
    const date = answers["raceDate"];
    const window = answers["goalHorizonWeeks"];
    const hrs = answers["hours"];
    const mi = answers["currentMileage"];

    const summaryParts = [
      `Name: ${name}`,
      `Mode: ${mode || "-"}`,
      `Distance: ${dist || "-"}`,
      `Current time: ${cur || "-"}`,
      `Goal time: ${goal || "-"}`,
      date ? `Race date: ${date}` : window ? `Window: ${window} weeks` : "",
      `Hours/week: ${hrs || "-"}`,
      `Weekly distance: ${mi || "-"}`,
    ].filter(Boolean);

    botSay("Here’s what I’ve got:");
    botSay(summaryParts.join(" • "));
    setReplies([
      { label: "Looks good", value: "ok" },
      { label: "I’ll edit later", value: "ok" },
    ]);
    setNode("confirm");
  }, [answers, botSay, setReplies]);

  const persistDefaults = useCallback(() => {
    setAnswers((a) => {
      const next = { ...a };
      if (!next["units"]) next["units"] = "km";
      return next;
    });
  }, []);

  const sendText = useCallback(
    (raw?: string) => {
      const text = (raw ?? "").trim() || input.trim();
      if (!text) return;
      const now = Date.now();
      setMessages((cur) =>
        cur.concat({ id: uid(), author: "user", text, ts: now })
      );
      setInput("");

      if (node === "askName") {
        const name = text.split(/\s+/)[0];
        setAnswers((a) => ({ ...a, name }));
        persistDefaults();
        nextTargetMode(name);
        return;
      }

      if (node === "askTargetMode") {
        const v = text.toLowerCase();
        let mode = "";
        if (v.includes("time") || v.includes("trial")) mode = "timeTrial";
        else if (v.includes("tbd")) mode = "raceTbd";
        else if (v.includes("race")) mode = "race";
        if (!mode) {
          botSay("Please choose one of the options.");
          return;
        }
        setAnswers((a) => ({ ...a, targetMode: mode }));
        setQuickReplies([]);
        nextDistance();
        return;
      }

      if (node === "askDistance") {
        const v = text.toLowerCase();
        const map: Record<string, string> = {
          "5k": "5k",
          "5": "5k",
          "10k": "10k",
          "10": "10k",
          half: "half",
          marathon: "marathon",
          ultra: "ultra",
        };
        const pick = map[v] || v;
        if (!["5k", "10k", "half", "marathon", "ultra"].includes(pick)) {
          botSay("Please pick 5K, 10K, Half, Marathon or Ultra.");
          return;
        }
        setAnswers((a) => ({ ...a, raceDistance: pick }));
        nextCurrentTime();
        return;
      }

      if (node === "askCurrentTime") {
        const norm = normaliseTime(text);
        if (!norm) {
          botSay("Please enter time as HH:MM:SS or MM:SS.");
          return;
        }
        setAnswers((a) => ({ ...a, currentFitnessTime: norm }));
        nextTargetTime();
        return;
      }

      if (node === "askTargetTime") {
        if (text.toLowerCase() !== "skip") {
          const norm = normaliseTime(text);
          if (!norm) {
            botSay("Enter HH:MM:SS, MM:SS, or type Skip.");
            return;
          }
          setAnswers((a) => ({ ...a, targetTime: norm }));
        }
        const mode = String(answers["targetMode"] || "");
        nextRaceDateOrWindow(mode);
        return;
      }

      if (node === "askRaceDate") {
        if (!isISODate(text)) {
          botSay("Please use YYYY-MM-DD.");
          return;
        }
        setAnswers((a) => ({ ...a, raceDate: text }));
        nextHours();
        return;
      }

      if (node === "askHorizonWeeks") {
        const n = Number(text);
        if (!Number.isFinite(n) || n <= 0) {
          botSay("Enter a positive number of weeks.");
          return;
        }
        setAnswers((a) => ({ ...a, goalHorizonWeeks: String(Math.round(n)) }));
        nextHours();
        return;
      }

      if (node === "askHours") {
        const n = Number(text);
        if (!Number.isFinite(n) || n < 0) {
          botSay("Enter hours per week as a number.");
          return;
        }
        setAnswers((a) => ({ ...a, hours: Math.round(n) }));
        nextMileage();
        return;
      }

      if (node === "askMileage") {
        const n = Number(text);
        if (!Number.isFinite(n) || n < 0) {
          botSay("Enter a non-negative number.");
          return;
        }
        setAnswers((a) => ({ ...a, currentMileage: Math.round(n) }));
        nextLongest();
        return;
      }

      if (node === "askLongest") {
        if (text.toLowerCase() !== "skip") {
          const n = Number(text);
          if (!Number.isFinite(n) || n < 0) {
            botSay("Enter a non-negative number or type Skip.");
            return;
          }
          setAnswers((a) => ({ ...a, longestRun: Math.round(n) }));
        }
        nextRecent5k();
        return;
      }

      if (node === "askRecent5k") {
        if (text.toLowerCase() !== "skip") {
          const norm = normaliseTime(text);
          if (!norm) {
            botSay("Enter HH:MM:SS, MM:SS, or type Skip.");
            return;
          }
          setAnswers((a) => ({ ...a, recent5kTime: norm }));
        }
        nextConfirm();
        return;
      }

      if (node === "confirm") {
        setQuickReplies([]);
        botSay(
          "All set. You can review or tweak any fields on the next screen."
        );
        return;
      }
    },
    [
      input,
      node,
      answers,
      botSay,
      nextTargetMode,
      nextDistance,
      nextCurrentTime,
      nextTargetTime,
      nextRaceDateOrWindow,
      nextHours,
      nextMileage,
      nextLongest,
      nextRecent5k,
      nextConfirm,
      persistDefaults,
    ]
  );

  const sendOption = useCallback(
    (value: string) => {
      sendText(value);
    },
    [sendText]
  );

  const reset = useCallback(() => {
    setMessages(seedBot());
    setNode("askName");
    setAnswers({});
    setQuickReplies([]);
  }, []);

  const ctx = useMemo(
    () => ({
      chatOpen,
      setChatOpen,
      messages,
      input,
      setInput,
      quickReplies,
      sendText,
      sendOption,
      reset,
    }),
    [chatOpen, messages, input, quickReplies, sendText, sendOption, reset]
  );

  return (
    <ChatWizardContext.Provider value={ctx}>
      {children}
    </ChatWizardContext.Provider>
  );
}
