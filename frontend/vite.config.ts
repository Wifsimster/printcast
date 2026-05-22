import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const version = fs.readFileSync(path.resolve(__dirname, "../VERSION"), "utf8").trim();
const buildDate = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8080",
      "/health": "http://localhost:8080",
      "/metrics": "http://localhost:8080",
      "/print": "http://localhost:8080",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
