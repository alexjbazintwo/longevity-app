// src/App.tsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "@/components/layout/header";
import Home from "@/pages/home";
import PlanSetup from "@/pages/planSetup";
import PlanPreview from "@/pages/planPreview";

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<PlanSetup />} />
          <Route path="/plan-preview" element={<PlanPreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
