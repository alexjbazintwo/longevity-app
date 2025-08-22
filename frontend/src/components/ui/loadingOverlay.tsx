// src/components/ui/loadingOverlay.tsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type LoadingOverlayProps = {
  show: boolean;
  title?: string;
  subtitle?: string;
  steps?: string[];
};

export default function LoadingOverlay({
  show,
  title = "Preparing something great…",
  subtitle = "Calibrating details to fit you perfectly.",
  steps = ["Loading", "Crunching", "Polishing", "Finalizing"],
}: LoadingOverlayProps) {
  const [stepIdx, setStepIdx] = useState<number>(0);

  useEffect(() => {
    if (!show || steps.length <= 1) return;
    setStepIdx(0);
    const id = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % steps.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [show, steps.length]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[60] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Ambient backdrop */}
          <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0b1026] via-[#0b1026] to-black" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_15%_-10%,rgba(251,191,36,0.18),transparent_40%),radial-gradient(700px_400px_at_85%_0%,rgba(56,189,248,0.16),transparent_42%),radial-gradient(700px_500px_at_70%_90%,rgba(16,185,129,0.20),transparent_40%)]" />

          {/* Loader cluster */}
          <div className="relative mx-4 w-[min(680px,90vw)]">
            {/* Conic ring spinner */}
            <motion.div
              className="relative mx-auto h-44 w-44 sm:h-52 sm:w-52 rounded-full bg-[conic-gradient(from_0deg,rgba(251,191,36,0.85),rgba(56,189,248,0.85),rgba(16,185,129,0.9),rgba(251,191,36,0.85))]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 12 }}
            >
              <div className="absolute inset-2 rounded-full bg-black/85 ring-1 ring-white/10" />

              {/* Orbiting nodes */}
              <motion.span
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-[calc(50%-72px)] rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.65)]"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 3.2 }}
                style={{ transformOrigin: "50% calc(50% + 72px)" }}
              />
              <motion.span
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-[calc(50%-56px)] rounded-full bg-emerald-300/90 shadow-[0_0_16px_rgba(110,231,183,0.65)]"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 2.4 }}
                style={{ transformOrigin: "50% calc(50% + 56px)" }}
              />
              <motion.span
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-[calc(50%-40px)] rounded-full bg-cyan-300/90 shadow-[0_0_14px_rgba(103,232,249,0.65)]"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 1.8 }}
                style={{ transformOrigin: "50% calc(50% + 40px)" }}
              />
            </motion.div>

            {/* Title / subtitle */}
            <div className="mt-6 text-center">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                {title}
              </h2>
              <p className="mt-2 text-sm text-white/80">{subtitle}</p>
            </div>

            {/* Step chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {steps.map((s, i) => {
                const isActive = i === stepIdx;
                const isDone =
                  steps.length > 1 &&
                  stepIdx > i &&
                  (stepIdx !== steps.length - 1 || stepIdx > i);
                return (
                  <div
                    key={`${s}-${i}`}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                      isDone
                        ? "border-emerald-300/60 bg-emerald-400/10 text-emerald-100"
                        : isActive
                        ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-100"
                        : "border-white/15 bg-white/5 text-white/75",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300" />
                    )}
                    <span className="whitespace-nowrap">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
