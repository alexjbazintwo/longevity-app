import { useCallback, useEffect, useMemo, useState } from "react";
import ChatWizardContext from "@/context/chatWizardContext";
import type {
  ChatMessage,
  Reply,
  Answers,
  Node,
  ChatWizardContextValue,
} from "@/context/chatWizardContext";

const lsPrefix = "chatWizard";
const lsMsgs = `${lsPrefix}.messages`;
const lsNode = `${lsPrefix}.node`;
const lsAns = `${lsPrefix}.answers`;

function uid() {
  return Math.random().toString(36).slice(2);
}

const nodeOrder: Node[] = [
  "askName",
  "askTargetMode",
  "askDistance",
  "askCurrentTime",
  "askTargetTime",
  "askRaceDate",
  "askHorizonWeeks",
  "askHours",
  "askMileage",
  "askLongest",
  "askRecent5k",
  "confirm",
];

const nodeAnswerKeys: Record<Node, string[]> = {
  askName: ["name"],
  askTargetMode: ["targetMode"],
  askDistance: ["raceDistance"],
  askCurrentTime: ["currentFitnessTime"],
  askTargetTime: ["targetTime"],
  askRaceDate: ["raceDate"],
  askHorizonWeeks: ["goalHorizonWeeks"],
  askHours: ["hours"],
  askMileage: ["currentMileage"],
  askLongest: ["longestRun"],
  askRecent5k: ["recent5kTime"],
  confirm: [],
};

function seedBot(): ChatMessage[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      author: "bot",
      text: "Hi! I’m Coach Kaia. Let’s get your goal dialed in.",
      ts: now,
      kind: "text",
    },
    {
      id: uid(),
      author: "bot",
      text: "What’s your name?",
      ts: now + 1,
      kind: "prompt",
      node: "askName",
    },
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
    const mm = String(Math.max(0, Number(M) || 0)).padStart(2, "0");
    const ss = String(Math.max(0, Math.min(59, Number(S) || 0))).padStart(
      2,
      "0"
    );
    return `0:${mm}:${ss}`;
  }
  return "";
}

function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
}

function nodeAllowsSkip(n: Node): boolean {
  return n === "askTargetTime" || n === "askLongest" || n === "askRecent5k";
}

function repliesForNode(n: Node): Reply[] {
  if (n === "askTargetMode") {
    return [
      { label: "Race date set", value: "race" },
      { label: "Race date TBD", value: "raceTbd" },
      { label: "PR / time-trial", value: "timeTrial" },
    ];
  }
  if (n === "askDistance") {
    return [
      { label: "5K", value: "5k" },
      { label: "10K", value: "10k" },
      { label: "Half Marathon", value: "half" },
      { label: "Marathon", value: "marathon" },
      { label: "Ultra", value: "ultra" },
    ];
  }
  if (n === "askTargetTime") return [{ label: "Skip", value: "skip" }];
  if (n === "askHorizonWeeks")
    return [
      { label: "6", value: "6" },
      { label: "8", value: "8" },
      { label: "10", value: "10" },
      { label: "12", value: "12" },
    ];
  if (n === "askLongest") return [{ label: "Skip", value: "skip" }];
  if (n === "askRecent5k") return [{ label: "Skip", value: "skip" }];
  if (n === "confirm")
    return [
      { label: "Looks good", value: "ok" },
      { label: "I’ll edit later", value: "ok" },
    ];
  return [];
}

export default function ChatWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(lsMsgs);
      if (raw) {
        const arr = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch {
      console.warn("read messages failed");
    }
    return seedBot();
  });

  const [node, setNode] = useState<Node>(() => {
    try {
      const raw = localStorage.getItem(lsNode) as Node | null;
      return raw ?? "askName";
    } catch {
      console.warn("read node failed");
      return "askName";
    }
  });

  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const raw = localStorage.getItem(lsAns);
      return raw ? (JSON.parse(raw) as Answers) : {};
    } catch {
      console.warn("read answers failed");
      return {};
    }
  });

  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [quickReplies, setQuickReplies] = useState<Reply[]>(() =>
    repliesForNode(node)
  );

  useEffect(() => {
    try {
      localStorage.setItem(lsMsgs, JSON.stringify(messages));
    } catch {
      console.warn("write messages failed");
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(lsNode, node);
    } catch {
      console.warn("write node failed");
    }
  }, [node]);

  useEffect(() => {
    try {
      localStorage.setItem(lsAns, JSON.stringify(answers));
    } catch {
      console.warn("write answers failed");
    }
    try {
      const prev = localStorage.getItem("setupAnswers");
      const merged = prev ? { ...JSON.parse(prev), ...answers } : answers;
      localStorage.setItem("setupAnswers", JSON.stringify(merged));
    } catch {
      console.warn("write setupAnswers failed");
    }
  }, [answers]);

  const push = useCallback((m: ChatMessage | ChatMessage[]) => {
    const arr = Array.isArray(m) ? m : [m];
    setMessages((cur) => cur.concat(arr));
  }, []);

  const ask = useCallback(
    (n: Node, text: string) => {
      setNode(n);
      setQuickReplies(repliesForNode(n));
      push({
        id: uid(),
        author: "bot",
        text,
        ts: Date.now(),
        kind: "prompt",
        node: n,
      });
    },
    [push]
  );

  const botSayText = useCallback(
    (text: string) => {
      push({ id: uid(), author: "bot", text, ts: Date.now(), kind: "text" });
    },
    [push]
  );

  const nextTargetMode = useCallback(
    (name: string) => {
      ask(
        "askTargetMode",
        `Nice to meet you, ${name}. Are you training for a set race date, a race with date TBD, or just a PR/time-trial?`
      );
    },
    [ask]
  );

  const nextDistance = useCallback(() => {
    ask("askDistance", "Great. What distance are we targeting?");
  }, [ask]);

  const nextCurrentTime = useCallback(() => {
    ask(
      "askCurrentTime",
      "If you raced this distance today, what time would you run? Use HH:MM:SS or MM:SS."
    );
  }, [ask]);

  const nextTargetTime = useCallback(() => {
    ask(
      "askTargetTime",
      "What’s your goal time? You can type Skip to continue."
    );
  }, [ask]);

  const nextRaceDateOrWindow = useCallback(
    (mode: string) => {
      if (mode === "race") {
        ask("askRaceDate", "What’s the race date? Use YYYY-MM-DD.");
      } else {
        ask(
          "askHorizonWeeks",
          "What training window are you thinking, in weeks? For example: 10"
        );
      }
    },
    [ask]
  );

  const nextHours = useCallback(() => {
    ask("askHours", "How many hours per week can you run?");
  }, [ask]);

  const nextMileage = useCallback(() => {
    ask("askMileage", "What’s your current weekly distance? Enter a number.");
  }, [ask]);

  const nextLongest = useCallback(() => {
    ask(
      "askLongest",
      "Longest continuous run in the last 4–6 weeks? You can type Skip."
    );
  }, [ask]);

  const nextRecent5k = useCallback(() => {
    ask("askRecent5k", "Most recent 5K time? You can type Skip.");
  }, [ask]);

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

    botSayText("Here’s what I’ve got:");
    botSayText(summaryParts.join(" • "));
    ask("confirm", "Ready to continue?");
  }, [answers, ask, botSayText]);

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
        cur.concat({ id: uid(), author: "user", text, ts: now, kind: "text" })
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
          botSayText("Please choose one of the options.");
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
          botSayText("Please pick 5K, 10K, Half, Marathon or Ultra.");
          return;
        }
        setAnswers((a) => ({ ...a, raceDistance: pick }));
        nextCurrentTime();
        return;
      }

      if (node === "askCurrentTime") {
        const norm = normaliseTime(text);
        if (!norm) {
          botSayText("Please enter time as HH:MM:SS or MM:SS.");
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
            botSayText("Enter HH:MM:SS, MM:SS, or type Skip.");
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
          botSayText("Please use YYYY-MM-DD.");
          return;
        }
        setAnswers((a) => ({ ...a, raceDate: text }));
        nextHours();
        return;
      }

      if (node === "askHorizonWeeks") {
        const n = Number(text);
        if (!Number.isFinite(n) || n <= 0) {
          botSayText("Enter a positive number of weeks.");
          return;
        }
        setAnswers((a) => ({ ...a, goalHorizonWeeks: String(Math.round(n)) }));
        nextHours();
        return;
      }

      if (node === "askHours") {
        const n = Number(text);
        if (!Number.isFinite(n) || n < 0) {
          botSayText("Enter hours per week as a number.");
          return;
        }
        setAnswers((a) => ({ ...a, hours: Math.round(n) }));
        nextMileage();
        return;
      }

      if (node === "askMileage") {
        const n = Number(text);
        if (!Number.isFinite(n) || n < 0) {
          botSayText("Enter a non-negative number.");
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
            botSayText("Enter a non-negative number or type Skip.");
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
            botSayText("Enter HH:MM:SS, MM:SS, or type Skip.");
            return;
          }
          setAnswers((a) => ({ ...a, recent5kTime: norm }));
        }
        nextConfirm();
        return;
      }

      if (node === "confirm") {
        setQuickReplies([]);
        setIsComplete(true);
        botSayText(
          "All set. You can review or tweak any fields on the next screen."
        );
        return;
      }
    },
    [
      input,
      node,
      answers,
      nextTargetMode,
      botSayText,
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

  const goBackOne = useCallback(() => {
    const promptIndexes = messages
      .map((m, i) => ({ i, m }))
      .filter(({ m }) => m.kind === "prompt" && m.node) as Array<{
      i: number;
      m: ChatMessage & { node: Node; kind: "prompt" };
    }>;

    if (promptIndexes.length < 2) return;

    const prevPrompt = promptIndexes[promptIndexes.length - 2];
    const prevNode = prevPrompt.m.node;

    setMessages((cur) => cur.slice(0, prevPrompt.i + 1));
    setNode(prevNode);
    setQuickReplies(repliesForNode(prevNode));
    setIsComplete(false);

    const cutoffIdx = nodeOrder.indexOf(prevNode);
    if (cutoffIdx >= 0) {
      const keysToClear = nodeOrder
        .slice(cutoffIdx + 1)
        .flatMap((n) => nodeAnswerKeys[n]);
      if (keysToClear.length > 0) {
        setAnswers((a) => {
          const next = { ...a };
          keysToClear.forEach((k) => {
            delete next[k];
          });
          return next;
        });
      }
    }
    setInput("");
  }, [messages]);

  const reset = useCallback(() => {
    setMessages(seedBot());
    setNode("askName");
    setAnswers({});
    setQuickReplies(repliesForNode("askName"));
    setInput("");
    setIsComplete(false);
  }, []);

  const ctx: ChatWizardContextValue = useMemo(
    () => ({
      messages,
      input,
      setInput,
      quickReplies,
      canSkip: nodeAllowsSkip(node),
      isComplete,
      sendText,
      sendOption,
      goBackOne,
      reset,
    }),
    [
      messages,
      input,
      node,
      isComplete,
      quickReplies,
      sendText,
      sendOption,
      goBackOne,
      reset,
    ]
  );

  return (
    <ChatWizardContext.Provider value={ctx}>
      {children}
    </ChatWizardContext.Provider>
  );
}
