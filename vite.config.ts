import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"), // ✅ updated for Netlify
    emptyOutDir: true,

    // Optimize build for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "framer-motion"],
          utils: ["@/lib/utils"],
        },
      },
    },

    // Enable production debugging
    sourcemap: true,

    // Optimize asset handling
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,

    // Improve CSS performance
    cssCodeSplit: true,
    cssMinify: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
