import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home";
import LongevityForm from "./pages/longevityForm";
import LongevityResult from "./pages/longevityResult";
import { ResultProvider } from "./context/resultContext";

function App() {
  return (
    <BrowserRouter>
      <ResultProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/life-expectancy-form" element={<LongevityForm />} />
          <Route path="/life-expectancy-result" element={<LongevityResult />} />
        </Routes>
        <Footer />
      </ResultProvider>
    </BrowserRouter>
  );
}

export default App;
