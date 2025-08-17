import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "@/components/header";
import Home from "@/pages/home";
import PlanSetup from "@/pages/planSetup";
import PlanPreview from "@/pages/planPreview";
import VerticalProvider from "@/context/VerticalProvider";

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
    <VerticalProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<PlanSetup />} />
            <Route path="/plan-preview" element={<PlanPreview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </VerticalProvider>
  );
}
