import { createContext } from "react";

export type Author = "bot" | "user";

export type ChatMessage = {
  id: string;
  author: Author;
  text: string;
  ts: number;
  kind?: "prompt" | "text";
  node?: Node;
};

export type Reply = { label: string; value: string };

export type Answers = Record<string, string | number>;

export type Node =
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

export type ChatWizardContextValue = {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;

  quickReplies: Reply[];
  canSkip: boolean;
  isComplete: boolean;

  sendText: (text?: string) => void;
  sendOption: (value: string) => void;
  goBackOne: () => void;
  reset: () => void;
};

const ChatWizardContext = createContext<ChatWizardContextValue | null>(null);
export default ChatWizardContext;
