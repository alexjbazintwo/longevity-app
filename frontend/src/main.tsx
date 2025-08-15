import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { VerticalProvider } from "@/context/verticalContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <VerticalProvider>
      <App />
    </VerticalProvider>
  </React.StrictMode>
);
