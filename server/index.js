"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const vite_1 = require("./vite");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// Add CORS and security headers
app.use((req, res, next) => {
    // CORS headers
    const allowedOrigins = [
        'http://localhost:5173', // Vite dev server
        'http://localhost:3000', // Alternative dev port
        'https://jamesmwaura.netlify.app/', // Replace with your actual Netlify URL
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});
// Configure port and host from environment variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
// Enable trust proxy for cloud deployment
app.set("trust proxy", 1);
// Configure static file serving based on environment
if (process.env.NODE_ENV === "production") {
    const staticPath = path_1.default.join(import.meta.dirname, "..", "dist", "public");
    app.use(express_1.default.static(staticPath, {
        maxAge: "1y",
        etag: true,
        lastModified: true
    }));
}
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
(async () => {
    const server = await (0, routes_1.registerRoutes)(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        (0, vite_1.log)(`Error: ${message}`);
        res.status(status).json({ error: message });
    });
    if (process.env.NODE_ENV !== "production") {
        await (0, vite_1.setupVite)(app, server);
    }
    server.listen(PORT, () => {
        (0, vite_1.log)(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    });
})();
