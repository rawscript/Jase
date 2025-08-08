"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    resolve: {
        alias: {
            "@": path_1.default.resolve(import.meta.dirname, "client", "src"),
            "@shared": path_1.default.resolve(import.meta.dirname, "shared"),
            "@assets": path_1.default.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    root: path_1.default.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path_1.default.resolve(import.meta.dirname, "dist"), // ✅ standardized build output
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
