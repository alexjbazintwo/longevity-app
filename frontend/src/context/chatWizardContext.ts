// src/context/chatWizardContext.ts
import { createContext } from "react";

export type ChatMessage = {
  id: string;
  author: "bot" | "user";
  text: string;
  ts: number;
};

export type Reply = {
  label: string;
  value: string;
};

export type Node =
  | "askName"
  | "askAge"
  | "askReason"
  | "askGoalKind"
  | "askPrimaryOutcome"
  | "askUnits"
  | "askDistance"
  | "askRaceDate"
  | "askWindowUnit"
  | "askHorizonWeeks"
  | "askHorizonMonths"
  | "askCurrentTime"
  | "askTargetTime"
  | "askRecent5k"
  | "askComfortablePace"
  | "askHours"
  | "askMileage"
  | "askLongestTime"
  | "askInjuries"
  | "askSafeDistance"
  | "askSafePace"
  | "askAddOns"
  | "confirm";

export type Answers = Record<string, string | number>;

export type ChatWizardContextValue = {
  messages: ChatMessage[];
  quickReplies: Reply[];
  node: Node;
  answers: Answers;

  input: string;
  setInput: (s: string) => void;

  sendText: (text?: string) => void;
  sendOption: (value: string) => void;
  sendDate: (iso: string) => void;

  goBackOne: () => void;
  reset: () => void;

  isComplete: boolean;

  startOnMonday: boolean;
  toggleStartOnMonday: () => void;
};

const ChatWizardContext = createContext<ChatWizardContextValue | null>(null);
export default ChatWizardContext;
