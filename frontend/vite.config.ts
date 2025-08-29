import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: {
    fs: {
      // Allow the dev server to serve files from the repo root (so ../shared works)
      allow: [path.resolve(__dirname, "..")],
    },
  },
});
