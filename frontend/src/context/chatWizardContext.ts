// src/context/chatWizardContext.ts
import { createContext } from "react";

export type Author = "bot" | "user";

export type ChatMessage = {
  id: string;
  author: Author;
  text: string;
  ts: number;
};

export type Reply = { label: string; value: string };

export type Ctx = {
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  quickReplies: Reply[];
  sendText: (text?: string) => void;
  sendOption: (value: string) => void;
  reset: () => void;
};

export const ChatWizardContext = createContext<Ctx | null>(null);
