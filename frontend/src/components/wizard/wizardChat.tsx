import { useContext, useRef, useEffect, useState } from "react";
import ChatWizardContext from "@/context/chatWizardContext";
import { RotateCcw } from "lucide-react";

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      className="stroke-current"
    >
      <path
        d="M15 6l-6 6 6 6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RotateIcon() {
  return <RotateCcw className="h-4 w-4" strokeWidth={2} />;
}



export function WizardChat() {
  const ctx = useContext(ChatWizardContext);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [ctx?.messages.length]);

  if (!ctx) return null;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-indigo-300/15 bg-white/5 ring-1 ring-indigo-400/10 backdrop-blur">
          <div className="px-5 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-white/80">
              Coach Kaia
            </div>
            <div className="relative">
              {!confirmReset ? (
                <button
                  type="button"
                  aria-label="Reset chat"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
                >
                  <RotateIcon />
                  <span>Reset</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">Confirm reset?</span>
                  <button
                    type="button"
                    onClick={() => {
                      ctx.reset();
                      setConfirmReset(false);
                    }}
                    className="rounded-full bg-rose-400/90 px-3 py-1.5 text-xs font-semibold text-black hover:bg-rose-300/90"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 pt-0 sm:p-8 sm:pt-0">
            <div
              ref={scrollerRef}
              className="max-h-[60vh] overflow-y-auto pr-1 space-y-3 pt-4"
            >
              {ctx.messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.author === "bot"
                      ? "flex justify-start"
                      : "flex justify-end"
                  }
                >
                  <div
                    className={[
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      m.author === "bot"
                        ? m.kind === "prompt"
                          ? "bg-indigo-400/15 text-white ring-1 ring-indigo-300/20"
                          : "bg-white/10 text-white"
                        : "bg-emerald-300/90 text-black",
                    ].join(" ")}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {ctx.quickReplies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {ctx.quickReplies.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => ctx.sendOption(r.value)}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/90 hover:bg-white/15"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-stretch gap-2">
              <button
                type="button"
                onClick={ctx.goBackOne}
                aria-label="Previous"
                className="h-10 w-10 flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              >
                <ChevronLeftIcon />
              </button>

              <input
                value={ctx.input}
                onChange={(e) => ctx.setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ctx.sendText();
                }}
                placeholder="Type your answer…"
                className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
              />

              <button
                type="button"
                onClick={() => ctx.sendText()}
                className="rounded-xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 px-4 py-2 text-sm font-semibold text-black"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
