import { useContext, useEffect, useMemo, useRef, useState } from "react";
import ChatWizardContext from "@/context/chatWizardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, RotateCw } from "lucide-react";

/**
 * Masked time input helpers: progressive fill + caret lock.
 */
function digitsToHMS(digits: string): string | null {
  if (digits.length !== 6) return null;
  const hh = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const ss = Number(digits.slice(4, 6));
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || !Number.isFinite(ss))
    return null;
  if (mm < 0 || mm > 59 || ss < 0 || ss > 59 || hh < 0) return null;
  return `${String(hh)}:${String(mm).padStart(2, "0")}:${String(ss).padStart(
    2,
    "0"
  )}`;
}
function digitsToMMSS(digits: string): string | null {
  if (digits.length !== 4) return null;
  const mm = Number(digits.slice(0, 2));
  const ss = Number(digits.slice(2, 4));
  if (!Number.isFinite(mm) || !Number.isFinite(ss)) return null;
  if (mm < 0 || mm > 59 || ss < 0 || ss > 59) return null;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function maskFromDigits(digits: string, template: string): string {
  const d = digits.replace(/\D+/g, "");
  let i = 0;
  let out = "";
  for (const ch of template) {
    if (/[HMS]/.test(ch)) {
      out += i < d.length ? d[i++] : ch;
    } else {
      out += ch;
    }
  }
  return out;
}
function formatHMSFromDigits(digits: string): string {
  return maskFromDigits(digits, "HH:MM:SS");
}
function formatMMSSFromDigits(digits: string): string {
  return maskFromDigits(digits, "MM:SS");
}

/** Next caret index for HH:MM:SS given number of typed digits (0-6). */
function hmsCaretIndex(len: number): number {
  switch (Math.max(0, Math.min(6, len))) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 3;
    case 3:
      return 4;
    case 4:
      return 6;
    case 5:
      return 7;
    default:
      return 8;
  }
}
/** Next caret index for MM:SS given number of typed digits (0-4). */
function mmssCaretIndex(len: number): number {
  switch (Math.max(0, Math.min(4, len))) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 3;
    case 3:
      return 4;
    default:
      return 5;
  }
}

/**
 * Progress %:
 * - Builds a linear list of steps based on current answers.
 * - Treats plan length (weeks/months) as a single logical step (if no race date).
 * - 'confirm' = 100%. Earlier steps scale evenly.
 */
function computeProgressPercent(
  node: string,
  answers: Record<string, string | number>
): number {
  const hasRaceDate = typeof answers["raceDate"] === "string";
  const steps: string[] = [
    "askName",
    "askReason",
    "askUnits",
    "askDistance",
    "askRaceDate",
  ];
  if (!hasRaceDate) {
    steps.push("planLength"); // represents askWindowUnit + one of horizon steps
  }
  steps.push(
    "askCurrentTime",
    "askTargetTime",
    "askRecent5k",
    "askComfortablePace",
    "askHours",
    "askMileage",
    "askLongestTime",
    "confirm"
  );

  // Map node -> logical step key
  const mapNode = (n: string): string => {
    if (
      n === "askWindowUnit" ||
      n === "askHorizonWeeks" ||
      n === "askHorizonMonths"
    ) {
      return "planLength";
    }
    return n;
  };

  const logical = mapNode(node);
  const idx = Math.max(0, steps.indexOf(logical));
  const denom = steps.length - 1; // confirm should be 100%
  if (denom <= 0) return 0;
  return Math.round((idx / denom) * 100);
}

export function WizardChat() {
  const ctx = useContext(ChatWizardContext)!;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [timeDigits, setTimeDigits] = useState("");
  const [paceDigits, setPaceDigits] = useState("");
  const [numDigits, setNumDigits] = useState("");

  const pct = useMemo(
    () => computeProgressPercent(ctx.node, ctx.answers),
    [ctx.node, ctx.answers]
  );

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [ctx.messages.length]);

  useEffect(() => {
    // Reset per-step inputs, then hydrate from saved answers
    setSelected(null);
    setText("");
    setDateVal("");
    setTimeDigits("");
    setPaceDigits("");
    setNumDigits("");

    const a = ctx.answers || {};
    switch (ctx.node) {
      case "askName": {
        if (typeof a.name === "string") setText(a.name);
        break;
      }
      case "askReason": {
        setSelected(typeof a.reason === "string" ? a.reason : null);
        break;
      }
      case "askUnits": {
        setSelected(typeof a.units === "string" ? a.units : null);
        break;
      }
      case "askDistance": {
        setSelected(typeof a.raceDistance === "string" ? a.raceDistance : null);
        break;
      }
      case "askRaceDate": {
        if (typeof a.raceDate === "string") setDateVal(a.raceDate);
        if (a.raceDateChoice === "noDate") setSelected("noDate");
        break;
      }
      case "askWindowUnit": {
        if (typeof a.goalHorizonWeeks === "string") setSelected("weeks");
        else if (typeof a.goalHorizonMonths === "string") setSelected("months");
        break;
      }
      case "askHorizonWeeks": {
        if (typeof a.goalHorizonWeeks === "string") {
          const val = a.goalHorizonWeeks.replace(/\D+/g, "");
          setNumDigits(val);
          setSelected(val || null);
        }
        break;
      }
      case "askHorizonMonths": {
        if (typeof a.goalHorizonMonths === "string") {
          const val = a.goalHorizonMonths.replace(/\D+/g, "");
          setNumDigits(val);
          setSelected(val || null);
        }
        break;
      }
      case "askCurrentTime": {
        if (a.askCurrentTimeSkipped === "yes") setSelected("skip");
        if (typeof a.currentFitnessTime === "string") {
          const parts = a.currentFitnessTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      case "askTargetTime": {
        if (a.askTargetTimeSkipped === "yes") setSelected("skip");
        if (typeof a.targetTime === "string") {
          const parts = a.targetTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      case "askRecent5k": {
        if (a.askRecent5kSkipped === "yes") setSelected("skip");
        if (typeof a.recent5kTime === "string") {
          const parts = a.recent5kTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      case "askComfortablePace": {
        if (a.askComfortablePaceSkipped === "yes") setSelected("skip");
        if (typeof a.comfortablePace === "string") {
          const parts = a.comfortablePace.split(":");
          if (parts.length === 2) setPaceDigits(parts[0] + parts[1]);
        }
        break;
      }
      case "askHours": {
        if (typeof a.hours === "number") {
          const val = String(a.hours);
          setNumDigits(val);
          setSelected(val);
        }
        break;
      }
      case "askMileage": {
        if (typeof a.currentMileage === "number") {
          const val = String(a.currentMileage);
          setNumDigits(val);
          setSelected(val);
        }
        break;
      }
      case "askLongestTime": {
        if (a.askLongestTimeSkipped === "yes") setSelected("skip");
        if (typeof a.longestRunTime === "string") {
          const parts = a.longestRunTime.split(":");
          if (parts.length === 3)
            setTimeDigits(parts[0].padStart(2, "0") + parts[1] + parts[2]);
        }
        break;
      }
      default:
        break;
    }
  }, [ctx.node, ctx.answers]);

  /** keep caret fixed at the "next digit" in HH:MM:SS inputs */
  useEffect(() => {
    if (
      ctx.node === "askCurrentTime" ||
      ctx.node === "askTargetTime" ||
      ctx.node === "askRecent5k" ||
      ctx.node === "askLongestTime"
    ) {
      const el = inputRef.current;
      if (el) {
        const pos = hmsCaretIndex(timeDigits.length);
        requestAnimationFrame(() => {
          el.setSelectionRange(pos, pos);
        });
      }
    }
  }, [timeDigits, ctx.node]);

  /** keep caret fixed at the "next digit" in MM:SS inputs */
  useEffect(() => {
    if (ctx.node === "askComfortablePace") {
      const el = inputRef.current;
      if (el) {
        const pos = mmssCaretIndex(paceDigits.length);
        requestAnimationFrame(() => {
          el.setSelectionRange(pos, pos);
        });
      }
    }
  }, [paceDigits, ctx.node]);

  const canProceed = useMemo((): boolean => {
    const n = ctx.node;

    if (n === "askName") return text.trim().length > 0;

    if (
      n === "askReason" ||
      n === "askUnits" ||
      n === "askDistance" ||
      n === "askWindowUnit"
    ) {
      return Boolean(selected);
    }

    if (n === "askRaceDate") {
      const hasDate = dateVal.trim().length > 0;
      const choseLength = selected === "noDate";
      return hasDate || choseLength;
    }

    if (n === "askHorizonWeeks" || n === "askHorizonMonths") {
      const v = Number(numDigits);
      return Number.isFinite(v) && v > 0;
    }

    if (
      n === "askCurrentTime" ||
      n === "askTargetTime" ||
      n === "askRecent5k"
    ) {
      const full = digitsToHMS(timeDigits);
      return Boolean(full) || selected === "skip";
    }

    if (n === "askComfortablePace") {
      const full = digitsToMMSS(paceDigits);
      return Boolean(full) || selected === "skip";
    }

    if (n === "askHours" || n === "askMileage") {
      const v = Number(numDigits);
      return Number.isFinite(v) && v >= 0;
    }

    if (n === "askLongestTime") {
      const full = digitsToHMS(timeDigits);
      return Boolean(full) || selected === "skip";
    }

    if (n === "confirm") return false;

    return false;
  }, [ctx.node, selected, text, dateVal, numDigits, timeDigits, paceDigits]);

  function submitNext(): void {
    const n = ctx.node;
    if (n === "askName") {
      ctx.sendText(text.trim());
      return;
    }
    if (
      n === "askReason" ||
      n === "askUnits" ||
      n === "askDistance" ||
      n === "askWindowUnit"
    ) {
      if (selected) ctx.sendOption(selected);
      return;
    }
    if (n === "askRaceDate") {
      if (selected === "noDate") {
        ctx.sendOption("noDate");
        return;
      }
      if (dateVal) {
        ctx.sendDate(dateVal);
        return;
      }
      return;
    }
    if (
      n === "askHorizonWeeks" ||
      n === "askHorizonMonths" ||
      n === "askHours" ||
      n === "askMileage"
    ) {
      ctx.sendText(numDigits);
      return;
    }
    if (
      n === "askCurrentTime" ||
      n === "askTargetTime" ||
      n === "askRecent5k"
    ) {
      if (selected === "skip") {
        ctx.sendOption("skip");
        return;
      }
      const full = digitsToHMS(timeDigits);
      if (full) ctx.sendText(full);
      return;
    }
    if (n === "askComfortablePace") {
      if (selected === "skip") {
        ctx.sendOption("skip");
        return;
      }
      const full = digitsToMMSS(paceDigits);
      if (full) ctx.sendText(full);
      return;
    }
    if (n === "askLongestTime") {
      if (selected === "skip") {
        ctx.sendOption("skip");
        return;
      }
      const full = digitsToHMS(timeDigits);
      if (full) ctx.sendText(full);
      return;
    }
  }

  // caret-lock helpers: prevent placing cursor mid-mask
  const inputRefLockHMS = (): void => {
    const el = inputRef.current;
    if (el) {
      const pos = hmsCaretIndex(timeDigits.length);
      el.setSelectionRange(pos, pos);
    }
  };
  const inputRefLockMMSS = (): void => {
    const el = inputRef.current;
    if (el) {
      const pos = mmssCaretIndex(paceDigits.length);
      el.setSelectionRange(pos, pos);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl">
        {/* Header with Reset above the card to avoid overlap with progress bar */}
        <div className="mb-2 relative flex justify-end">
          <button
            type="button"
            aria-label="Reset chat"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
          >
            <RotateCw className="h-4 w-4" />
            Reset
          </button>

          {confirmOpen && (
            <div className="absolute right-0 top-10 z-20 w-80 rounded-2xl border border-white/15 bg-[#0b1026]/95 p-4 backdrop-blur">
              <div className="text-sm text-white">Reset the conversation?</div>
              <div className="mt-2 text-xs text-white/70">
                This will restart the chat from the beginning and clear your
                answers in this flow.
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-xl text-black bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"
                  onClick={() => {
                    ctx.reset();
                    setConfirmOpen(false);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        <Card className="relative overflow-hidden rounded-3xl border-indigo-300/15 bg-white/5 ring-1 ring-indigo-400/10 backdrop-blur">
          <CardContent className="p-5 sm:p-8">
            {/* subtle progress bar */}
            <div className="mb-3">
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="text-center text-[12px] text-white/70">
              Answer a few quick questions and we’ll tune your plan.
            </div>

            <div
              ref={scrollerRef}
              className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-3"
            >
              {ctx.messages.map((m) => (
                <div key={m.id} className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-white/10 text-white">
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Hide quick replies when confirming OR once completed */}
            {ctx.quickReplies.length > 0 &&
              ctx.node !== "confirm" &&
              !ctx.isComplete && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ctx.quickReplies.map((r) => {
                    const active = selected === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setSelected(r.value);
                          // Sync numeric quick replies to the input
                          if (
                            ctx.node === "askHorizonWeeks" ||
                            ctx.node === "askHorizonMonths" ||
                            ctx.node === "askHours" ||
                            ctx.node === "askMileage"
                          ) {
                            if (/^\d+$/.test(r.value)) {
                              setNumDigits(r.value);
                            }
                          }
                        }}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs transition",
                          active
                            ? "border-emerald-300 bg-emerald-50/10 text-emerald-200"
                            : "border-white/20 bg-white/10 text-white hover:bg-white/15",
                        ].join(" ")}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Inline follow-ups for Strength/Mobility inside confirm step */}
            {ctx.node === "confirm" && !ctx.isComplete && (
              <div className="mt-4 space-y-3">
                {typeof ctx.answers.includeStrength !== "string" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm text-white/80">
                      Would you like us to include strength to your plan:
                    </div>
                    <button
                      type="button"
                      onClick={() => ctx.sendOption("strengthYes")}
                      className="rounded-full border border-emerald-300 bg-emerald-50/10 px-3 py-1.5 text-xs text-emerald-200 transition"
                    >
                      Include strength
                    </button>
                    <button
                      type="button"
                      onClick={() => ctx.sendOption("strengthSkip")}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                    >
                      Skip
                    </button>
                  </div>
                ) : typeof ctx.answers.includeMobility !== "string" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm text-white/80">
                      Would you like us to include mobility to your plan:
                    </div>
                    <button
                      type="button"
                      onClick={() => ctx.sendOption("mobilityYes")}
                      className="rounded-full border border-emerald-300 bg-emerald-50/10 px-3 py-1.5 text-xs text-emerald-200 transition"
                    >
                      Include mobility
                    </button>
                    <button
                      type="button"
                      onClick={() => ctx.sendOption("mobilitySkip")}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-white/80">
                    Great, we've added that. If you’d like to edit anything, use
                    the back arrow to jump to that step. Otherwise, press “Looks
                    good”.
                  </div>
                )}

                {/* Final step quick reply (Looks good) — hide after completion */}
                <div className="flex flex-wrap gap-2">
                  {ctx.quickReplies.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => ctx.sendOption(r.value)}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-stretch gap-2">
              <button
                type="button"
                aria-label="Previous"
                onClick={ctx.goBackOne}
                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
                title="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {ctx.node === "askRaceDate" ? (
                <input
                  type="date"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white outline-none focus:border-indigo-400/40"
                />
              ) : ctx.node === "askCurrentTime" ||
                ctx.node === "askTargetTime" ||
                ctx.node === "askRecent5k" ||
                ctx.node === "askLongestTime" ? (
                <input
                  ref={inputRef}
                  value={formatHMSFromDigits(timeDigits)}
                  onChange={(e) =>
                    setTimeDigits(
                      e.target.value.replace(/\D+/g, "").slice(0, 6)
                    )
                  }
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const el = inputRef.current;
                    if (el) {
                      el.focus();
                      inputRefLockHMS();
                    }
                  }}
                  onFocus={() => inputRefLockHMS()}
                  onKeyDown={(e) => {
                    if (!/[0-9]|Backspace|Delete|Tab|Enter/.test(e.key)) {
                      e.preventDefault();
                    }
                    if (e.key === "Enter" && canProceed) submitNext();
                  }}
                  placeholder="HH:MM:SS"
                  className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                />
              ) : ctx.node === "askComfortablePace" ? (
                <input
                  ref={inputRef}
                  value={formatMMSSFromDigits(paceDigits)}
                  onChange={(e) =>
                    setPaceDigits(
                      e.target.value.replace(/\D+/g, "").slice(0, 4)
                    )
                  }
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const el = inputRef.current;
                    if (el) {
                      el.focus();
                      inputRefLockMMSS();
                    }
                  }}
                  onFocus={() => inputRefLockMMSS()}
                  onKeyDown={(e) => {
                    if (!/[0-9]|Backspace|Delete|Tab|Enter/.test(e.key)) {
                      e.preventDefault();
                    }
                    if (e.key === "Enter" && canProceed) submitNext();
                  }}
                  placeholder="MM:SS"
                  className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                />
              ) : ctx.node === "askHorizonWeeks" ||
                ctx.node === "askHorizonMonths" ||
                ctx.node === "askHours" ||
                ctx.node === "askMileage" ? (
                <input
                  value={numDigits}
                  onChange={(e) =>
                    setNumDigits(e.target.value.replace(/\D+/g, ""))
                  }
                  onKeyDown={(e) => {
                    if (!/[0-9]|Backspace|Delete|Tab|Enter/.test(e.key)) {
                      e.preventDefault();
                    }
                    if (e.key === "Enter" && canProceed) submitNext();
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                />
              ) : (
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canProceed) submitNext();
                  }}
                  placeholder="Type your answer…"
                  className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/80 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-400/40"
                />
              )}

              <button
                type="button"
                disabled={!canProceed}
                onClick={submitNext}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold",
                  !canProceed
                    ? "bg-white/10 text-white/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 text-black",
                ].join(" ")}
              >
                Next
              </button>
            </div>

            {/* Post-confirmation panel */}
            {ctx.isComplete && (
              <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-cyan-400/10 to-emerald-400/10 p-5">
                <div className="text-lg font-semibold text-white">
                  Your AI-tuned week is nearly ready 🎉
                </div>
                <div className="mt-2 text-sm text-white/80">
                  Get a week that adapts to{" "}
                  <span className="font-medium">your</span> time, fitness, and
                  goal — not a generic plan.
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-white/80">
                  <li>• Personalised paces for every run</li>
                  <li>• Work:recovery perfectly tuned for your goal</li>
                  <li>• Smart tapering and milestone checks</li>
                  <li>• One-tap calendar export</li>
                </ul>
                <div className="mt-2 text-[11px] text-white/60">
                  No spam — we’ll save your setup so you can tweak it anytime.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
