import { createContext } from "react";

export type Author = "bot" | "user";

export type ChatMessage = {
  id: string;
  author: Author;
  text: string;
  ts: number;
};

export type Reply = { label: string; value: string };

export type Node =
  | "askName"
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
  | "askAddOns"
  | "confirm";


export type Answers = Record<string, string | number>;

export type ChatWizardContextValue = {
  messages: ChatMessage[];
  quickReplies: Reply[];
  input: string;
  setInput: (v: string) => void;
  sendText: (text?: string) => void;
  sendOption: (value: string) => void;
  sendDate: (iso: string) => void;
  goBackOne: () => void;
  reset: () => void;
  isComplete: boolean;
  startOnMonday: boolean;
  toggleStartOnMonday: () => void;
  node: Node;
  answers: Readonly<Answers>;
};

const ChatWizardContext = createContext<ChatWizardContextValue | null>(null);
export default ChatWizardContext;
