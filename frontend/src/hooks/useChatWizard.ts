import { useContext } from "react";
import ChatWizardContext, {
  type ChatWizardContextValue,
} from "@/context/chatWizardContext";

export function useChatWizard(): ChatWizardContextValue {
  const ctx = useContext(ChatWizardContext);
  if (!ctx) throw new Error("ChatWizardProvider is missing");
  return ctx;
}
export default useChatWizard;
