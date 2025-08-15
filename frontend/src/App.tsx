// src/App.tsx
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { ResultProvider } from "@/context/resultContext";

// Lazy-load pages
const Home = lazy(() => import("@/pages/home"));
const LongevityForm = lazy(() => import("@/pages/longevityForm"));
const LongevityResult = lazy(() => import("@/pages/longevityResult"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const PlanPreview = lazy(() => import("@/pages/planPreview"));

export default function App() {
  return (
    <BrowserRouter>
      <ResultProvider>
        <ScrollToTop />
        <AppShell />
      </ResultProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  return (
    <>
      <Header />
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/life-expectancy-form" element={<LongevityForm />} />
          <Route path="/life-expectancy-result" element={<LongevityResult />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/plan-preview" element={<PlanPreview />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-white/80">
      Loading…
    </div>
  );
}
