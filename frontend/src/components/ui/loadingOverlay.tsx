// src/components/ui/loadingOverlay.tsx
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils";

type LoadingOverlayProps = {
  show: boolean;
  title?: string;
  subtitle?: string;
  steps?: string[];
  className?: string;
};

export default function LoadingOverlay({
  show,
  title = "Handcrafting your AI-tuned week…",
  subtitle = "Paces, recovery, and progression — tailored to you.",
  steps = [
    "Analyzing answers",
    "Calibrating paces",
    "Building week",
    "Final checks",
  ],
  className,
}: LoadingOverlayProps) {
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    if (!show || steps.length === 0) return;
    setActiveStep(0);
    const id = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % steps.length);
    }, 1000);
    return () => window.clearInterval(id);
  }, [show, steps.length]);

  // Slightly thicker masks reduce aliasing on conic edges
  const donutMaskThin: CSSProperties = useMemo(
    () => ({
      maskImage:
        "radial-gradient(farthest-side, transparent calc(100% - 12px), #000 0)",
      WebkitMaskImage:
        "radial-gradient(farthest-side, transparent calc(100% - 12px), #000 0)",
    }),
    []
  );

  const donutMaskThick: CSSProperties = useMemo(
    () => ({
      maskImage:
        "radial-gradient(farthest-side, transparent calc(100% - 18px), #000 0)",
      WebkitMaskImage:
        "radial-gradient(farthest-side, transparent calc(100% - 18px), #000 0)",
    }),
    []
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            "fixed inset-0 z-[60] flex items-center justify-center overflow-hidden",
            "bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(251,191,36,0.18),transparent_40%),radial-gradient(900px_500px_at_85%_0%,rgba(56,189,248,0.16),transparent_42%),radial-gradient(700px_500px_at_70%_85%,rgba(16,185,129,0.18),transparent_40%)]",
            "bg-black/80 backdrop-blur-[6px]",
            className
          )}
          role="status"
          aria-live="polite"
          aria-busy="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Soft animated sheen across the backdrop */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            initial={false}
            animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 100%)",
              backgroundSize: "200% 100%",
              willChange: "background-position",
            }}
          />

          {/* Card */}
          <motion.div
            initial={{ y: 12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mx-4 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-white ring-1 ring-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8"
          >
            <div className="flex items-center gap-6 sm:gap-7">
              {/* 3D spinner */}
              <motion.div
                className="relative h-24 w-24 sm:h-28 sm:w-28"
                animate={{ rotateX: [14, -6, 14], rotateY: [-10, 8, -10] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Outer glossy conic ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    willChange: "transform",
                    background:
                      "conic-gradient(from 0deg, rgba(251,191,36,.25), rgba(56,189,248,.95), rgba(16,185,129,.95), rgba(251,191,36,.25))",
                    boxShadow: "0 0 40px rgba(16,185,129,.25)",
                    ...donutMaskThick,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "linear",
                  }}
                />

                {/* Bright sweeping arc (slight blur to reduce stair-steps) */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    willChange: "transform",
                    background:
                      "conic-gradient(from 0deg, rgba(255,255,255,0) 0 330deg, rgba(255,255,255,0.9) 345deg 360deg)",
                    ...donutMaskThin,
                    mixBlendMode: "screen",
                    filter: "blur(0.25px)",
                  }}
                  animate={{ rotate: -360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: "linear",
                  }}
                />

                {/* Counter-rotating dashed ring */}
                <motion.div
                  className="absolute inset-[10px] rounded-full border-2 border-white/35"
                  style={{ willChange: "transform", borderStyle: "dashed" }}
                  animate={{ rotate: -360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 4.6,
                    ease: "linear",
                  }}
                />

                {/* Orbiting orbs (parallax layers) */}
                <motion.div
                  className="absolute inset-1"
                  style={{ willChange: "transform" }}
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 5.4,
                    ease: "linear",
                  }}
                >
                  <div className="absolute left-1/2 top-0 -translate-x-1/2">
                    <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,.9)]" />
                  </div>
                </motion.div>
                <motion.div
                  className="absolute inset-3"
                  style={{ willChange: "transform" }}
                  animate={{ rotate: -360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 7.2,
                    ease: "linear",
                  }}
                >
                  <div className="absolute left-1/2 top-0 -translate-x-1/2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_14px_rgba(16,185,129,.9)]" />
                  </div>
                </motion.div>
                <motion.div
                  className="absolute inset-5"
                  style={{ willChange: "transform" }}
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 9.8,
                    ease: "linear",
                  }}
                >
                  <div className="absolute left-1/2 top-0 -translate-x-1/2">
                    <div className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(56,189,248,.9)]" />
                  </div>
                </motion.div>

                {/* Inner glass core */}
                <div className="absolute inset-4 rounded-full bg-black/50 ring-1 ring-white/15 backdrop-blur-sm" />
              </motion.div>

              {/* Titles */}
              <div className="min-w-0">
                <div className="text-lg font-semibold sm:text-xl">
                  <span className="bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                    {title}
                  </span>
                </div>
                <div className="mt-1 text-sm text-white/85">{subtitle}</div>
              </div>
            </div>

            {/* Steps + barber-pole progress */}
            {steps.length > 0 && (
              <>
                <div className="mt-6 grid gap-2 sm:gap-2.5">
                  {steps.map((s, i) => {
                    const isActive = i === activeStep;
                    return (
                      <div
                        key={s}
                        className={cn(
                          "relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs sm:text-[13px] ring-1 ring-white/10"
                        )}
                      >
                        {/* Left highlight bar */}
                        <motion.div
                          className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-amber-200 via-cyan-200 to-emerald-300"
                          animate={{ opacity: isActive ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full transition-colors",
                                isActive
                                  ? "bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300"
                                  : "bg-white/45"
                              )}
                            />
                            <span
                              className={cn(
                                "transition-colors",
                                isActive
                                  ? "bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300 bg-clip-text text-transparent"
                                  : "text-white/75"
                              )}
                            >
                              {s}
                            </span>
                          </div>

                          {/* Right shimmer meter when active */}
                          <motion.span
                            className="h-1 w-20 rounded-full bg-white/15"
                            animate={{
                              scaleX: isActive ? [0.2, 1, 0.35] : 0.65,
                              opacity: isActive ? [0.5, 1, 0.5] : 0.6,
                            }}
                            transition={{
                              duration: 1.0,
                              repeat: isActive ? Infinity : 0,
                              ease: "easeInOut",
                            }}
                            style={{ transformOrigin: "left" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Barber-pole rail */}
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.06] ring-1 ring-white/10">
                  <motion.div
                    className="h-full w-1/2"
                    animate={{ x: ["-50%", "100%"] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(110deg, rgba(255,255,255,0.22) 0 12px, rgba(255,255,255,0.06) 12px 24px)",
                      willChange: "transform",
                    }}
                  />
                </div>
              </>
            )}

            <span className="sr-only">Loading</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
