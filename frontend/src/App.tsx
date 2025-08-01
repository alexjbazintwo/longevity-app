import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LifeExpectancy from "./pages/LifeExpectancy";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/life-expectancy" element={<LifeExpectancy />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
