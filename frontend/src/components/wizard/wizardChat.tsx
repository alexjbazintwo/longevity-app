import { X, Send, MessageSquare } from "lucide-react";
import { useChatWizard } from "@/hooks/useChatWizard";
import ChatBubble from "./chatBubble";

export function WizardChat() {
  const {
    chatOpen,
    setChatOpen,
    messages,
    input,
    setInput,
    quickReplies,
    sendText,
    sendOption,
  } = useChatWizard();

  if (!chatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] overflow-hidden rounded-2xl border border-white/15 bg-[#0b1026]/95 ring-1 ring-white/10 backdrop-blur shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="text-sm font-semibold text-white">Coach Kaia</div>
        <button
          onClick={() => setChatOpen(false)}
          className="rounded-md p-1 text-white/80 hover:bg-white/10"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-80 overflow-y-auto space-y-2 p-3">
        {messages.map((m) => (
          <ChatBubble key={m.id} m={m} />
        ))}
      </div>

      {quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {quickReplies.map((r) => (
            <button
              key={r.label}
              onClick={() => sendOption(r.value)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendText();
          }}
          placeholder="Type your reply…"
          className="flex-1 rounded-xl border border-white/12 bg-[#0a1024] px-3 py-2 text-sm text-white outline-none focus:border-emerald-300/40"
        />
        <button
          onClick={() => sendText()}
          className="rounded-xl bg-emerald-300 px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ChatLauncher() {
  const { chatOpen, setChatOpen } = useChatWizard();
  if (chatOpen) return null;
  return (
    <button
      onClick={() => setChatOpen(true)}
      className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-emerald-300 text-black shadow-xl hover:opacity-90"
      aria-label="Open chat"
    >
      <MessageSquare className="h-5 w-5" />
    </button>
  );
}
