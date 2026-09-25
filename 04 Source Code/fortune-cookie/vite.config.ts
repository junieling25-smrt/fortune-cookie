import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build runs from any folder or static host.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2500,
  },
});
