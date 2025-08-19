import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ChatWizardProvider from "@/context/chatWizardProvider";
import ChatWizardContext from "@/context/chatWizardContext";
import { WizardChat } from "@/components/wizard/wizardChat";
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
      <div className="relative min-h-[calc(100vh-64px)]">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a1024] via-[#0a1024] to-black" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-8%,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.14),transparent_38%)]" />

        <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-12 sm:px-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Coach Kaia Setup
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
