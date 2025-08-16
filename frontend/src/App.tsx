import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import PlanSetup from "@/pages/planSetup";
import PlanPreview from "@/pages/planPreview";

function Layout() {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main className="bg-transparent">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="setup" element={<PlanSetup />} />
            <Route path="plan-preview" element={<PlanPreview />} />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}
