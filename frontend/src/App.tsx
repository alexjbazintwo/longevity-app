// src/App.tsx
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { ResultProvider } from "@/context/resultContext";

// Lazy-load pages for faster initial paint
const Home = lazy(() => import("@/pages/home"));
const LongevityForm = lazy(() => import("@/pages/longevityForm"));
const LongevityResult = lazy(() => import("@/pages/longevityResult"));

function App() {
  return (
    <BrowserRouter>
      <ResultProvider>
        <ScrollToTop />
        <AppLayout />
      </ResultProvider>
    </BrowserRouter>
  );
}

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {!isHome && <Header />}

      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/life-expectancy-form" element={<LongevityForm />} />
          <Route path="/life-expectancy-result" element={<LongevityResult />} />
        </Routes>
      </Suspense>

      {!isHome && <Footer />}
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

export default App;
