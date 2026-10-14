import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build runs from any folder or static host.
// SINGLE=1 folds the lazy chunks (city list, map) into the main bundle for the one-file build.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: process.env.SINGLE ? { output: { inlineDynamicImports: true } } : {},
  },
});
