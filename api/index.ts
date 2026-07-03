import { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { log } from "../server/vite";
import * as  express from 'express';

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enable trust proxy for cloud deployment
app.set("trust proxy", 1);

// Add CORS and security headers - MUST be first and handle all cases
app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    
    // Always set these headers for all requests including OPTIONS
    res.setHeader('Access-Control-Allow-Origin', origin === '*' ? '*' : origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests immediately
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    // Fixed: removed spread args to match Express's res.json signature
    res.json = function (bodyJson) {
        capturedJsonResponse = bodyJson;
        return originalResJson.call(res, bodyJson);
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
            log(logLine);
        }
    });

    next();
});

// Initialize routes
let routesInitialized = false;

const initializeApp = async () => {
    if (!routesInitialized) {
        try {
            await registerRoutes(app);
            routesInitialized = true;

            // Error handler registered AFTER routes so it can catch errors from them
            app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
                const status = err.status || err.statusCode || 500;
                const message = err.message || "Internal Server Error";
                console.error(`Error: ${message}`, err);
                res.status(status).json({ error: message });
            });
        } catch (error) {
            console.error("Failed to initialize routes:", error);
            throw error;
        }
    }
};

// Local dev server (skipped in production/Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    initializeApp().then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });
}

// Export for Vercel
export default async (req: Request, res: Response) => {
    await initializeApp();
    return app(req, res);
};