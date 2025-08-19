import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ChatWizardProvider from "@/context/chatWizardProvider";
import ChatWizardContext from "@/context/chatWizardContext";
import { WizardChat } from "@/components/wizard/wizardChat";

function SetupInner() {
  const navigate = useNavigate();
  const ctx = useContext(ChatWizardContext);

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a1024] via-[#0a1024] to-black" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-8%,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.14),transparent_38%)]" />

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-8">
        <WizardChat />

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/plan-preview")}
            disabled={!ctx?.isComplete}
            className={[
              "rounded-xl px-6 py-3 text-sm font-semibold transition",
              ctx?.isComplete
                ? "text-black bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 shadow-md"
                : "text-white/45 bg-white/5 border border-white/10 cursor-not-allowed",
            ].join(" ")}
          >
            See my AI-tuned week
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanSetup() {
  return (
    <ChatWizardProvider>
      <SetupInner />
    </ChatWizardProvider>
  );
}
