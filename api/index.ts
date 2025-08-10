import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { log } from "../server/vite";
import path from "path";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Add CORS and security headers
app.use((req, res, next) => {
    // CORS headers
    const allowedOrigins = [
        'http://localhost:5173', // Vite dev server
        'http://localhost:3000', // Alternative dev port
        'https://jasemwautra.com', // Your custom domain
        'https://jase.vercel.app', // Your Vercel backend URL (for testing)
        // Add your Amplify URL pattern - replace with your actual URL
        /https:\/\/.*\.amplifyapp\.com$/,
        // Add Vercel deployment URLs pattern
        /https:\/\/.*\.vercel\.app$/,
    ];

    const origin = req.headers.origin;
    const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
            return allowed === origin;
        } else {
            return allowed.test(origin as string);
        }
    });
    
    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin as string);
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

// Enable trust proxy for cloud deployment
app.set("trust proxy", 1);

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
        } catch (error) {
            console.error("Failed to initialize routes:", error);
        }
    }
};

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`Error: ${message}`, err);
    res.status(status).json({ error: message });
});

// Export for Vercel
export default async (req: Request, res: Response) => {
    await initializeApp();
    return app(req, res);
};