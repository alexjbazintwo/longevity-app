// src/pages/planSetup.tsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ChatWizardProvider from "@/context/chatWizardProvider";
import ChatWizardContext from "@/context/chatWizardContext";
import { WizardChat } from "@/components/features/plan-setup/wizardChat";
import { Button } from "@/components/ui/button";

function CTA() {
  const ctx = useContext(ChatWizardContext);
  const navigate = useNavigate();
  if (!ctx) return null;

  return (
    <div className="mt-6 flex justify-center">
      <Button
        disabled={!ctx.isComplete}
        onClick={() => navigate("/plan-preview")}
        className={[
          "rounded-xl px-6 py-3 text-sm font-semibold",
          ctx.isComplete
            ? "text-black bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"
            : "cursor-not-allowed border border-dashed border-white/20 bg-white/5 text-white/60",
        ].join(" ")}
      >
        See my AI-tuned week
      </Button>
    </div>
  );
}

export default function PlanSetup() {
  return (
    <ChatWizardProvider>
      {/* Base dark canvas + subtle color mesh */}
      <div className="relative min-h-[calc(100vh-64px)] bg-[#0a1024] text-white">
        {/* Layer 1: dark vertical gradient */}
        <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-[#0a1024] via-[#0a1024] to-black" />
        {/* Layer 2: soft radial color mesh (amber/cyan/emerald) */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_8%,rgba(251,191,36,0.18),transparent_40%),radial-gradient(ellipse_at_85%_12%,rgba(56,189,248,0.18),transparent_42%),radial-gradient(ellipse_at_50%_88%,rgba(16,185,129,0.18),transparent_46%)]" />
        {/* Layer 3: two subtle blurred orbs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 -z-10 rounded-full bg-gradient-to-tr from-amber-300/20 via-cyan-300/20 to-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 -z-10 rounded-full bg-gradient-to-br from-emerald-300/16 via-cyan-300/16 to-amber-300/16 blur-[100px]" />
        {/* Optional top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 -z-10 bg-gradient-to-b from-white/5 to-transparent" />

        <div className="relative mx-auto w-full max-w-5xl px-4 pb-20 pt-12 sm:px-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              <span className="bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                Coach Kaia Setup
              </span>
            </h1>
            <p className="mt-2 text-white/80">
              Answer a few quick questions and we’ll tune your plan.
            </p>
          </div>

          <WizardChat />
          <CTA />

          <p className="mt-6 text-center text-[12px] text-white/70">
            Plans adapt weekly — you can change answers anytime.
          </p>
        </div>
      </div>
    </ChatWizardProvider>
  );
}
