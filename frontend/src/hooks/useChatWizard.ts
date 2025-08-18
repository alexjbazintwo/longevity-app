import { useContext } from "react";
import { ChatWizardContext } from "@/context/chatWizardContext";

export function useChatWizard() {
  const ctx = useContext(ChatWizardContext);
  if (!ctx) throw new Error("ChatWizardProvider is missing");
  return ctx;
}
