import type { ChatMessage } from "@/context/chatWizardContext";

export default function ChatBubble({ m }: { m: ChatMessage }) {
  const mine = m.author === "user";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
          mine ? "bg-emerald-300 text-black" : "bg-white/10 text-white",
        ].join(" ")}
      >
        {m.text}
      </div>
    </div>
  );
}
