import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ChatWizardProvider from "@/context/chatWizardProvider";
import { ChatWizardContext } from "@/context/chatWizardContext";
import { WizardChat, ChatLauncher } from "@/components/wizard/wizardChat";

function ChatDebugOpenOnce() {
  const ctx = useContext(ChatWizardContext);
  useEffect(() => {
    if (ctx) ctx.setChatOpen(true);
  }, [ctx]);
  return null;
}

export default function PlanSetup() {
  const navigate = useNavigate();

  return (
    <ChatWizardProvider>
      <div className="relative min-h-[calc(100vh-64px)]">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a1024] via-[#0a1024] to-black" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-8%,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.14),transparent_38%)]" />

        <header className="sticky top-[64px] z-10 border-b border-indigo-300/15 bg-[#0b1026]/80 backdrop-blur">
          <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/90">
                Runzi Setup
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-8">
          <Card className="rounded-3xl border-indigo-300/15 bg-white/5 ring-1 ring-indigo-400/10 backdrop-blur">
            <CardContent className="p-6 sm:p-10">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                Let’s do this in chat
              </h1>
              <p className="mt-2 text-white/80">
                Coach Kaia will ask a few quick questions to tailor your plan
                for racing or a PR. You can tweak anything later on the preview
                screen.
              </p>

              <div className="mt-6">
                <Button
                  className="rounded-xl text-black bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"
                  onClick={() => navigate("/plan-preview")}
                >
                  See my AI-tuned week
                </Button>
              </div>

              <p className="mt-3 text-xs text-white/60">
                Prefer forms? We’ll add a form view later — this MVP focuses on
                a simple chat flow.
              </p>
            </CardContent>
          </Card>
        </div>

        <ChatDebugOpenOnce />
        <WizardChat />
        <ChatLauncher />
      </div>
    </ChatWizardProvider>
  );
}
