import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Production build for opening dist/index.html directly (file://, no Node server). */
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2015",
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: "iife",
        name: "SchedulingBoard",
        inlineDynamicImports: true,
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/app.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
