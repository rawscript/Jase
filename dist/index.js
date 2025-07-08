var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  contacts: () => contacts,
  insertContactSchema: () => insertContactSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users
});
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  subject: true,
  message: true
});

// server/db.ts
import dotenv from "dotenv";
import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
dotenv.config();
var { Pool } = pkg;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  // Maximum number of clients in the pool
  idleTimeoutMillis: 3e4,
  // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2e3,
  // Return an error after 2 seconds if connection could not be established
  statement_timeout: 1e4,
  // Terminate any statement that takes more than 10 seconds
  query_timeout: 5e3
  // Terminate any query that takes more than 5 seconds
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var cache = /* @__PURE__ */ new Map();
var CACHE_TTL = 5 * 60 * 1e3;
function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return void 0;
}
function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}
var DatabaseStorage = class {
  async getUser(id) {
    const cacheKey = `user:${id}`;
    const cachedUser = getCached(cacheKey);
    if (cachedUser) return cachedUser;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) setCache(cacheKey, user);
    return user || void 0;
  }
  async getUserByUsername(username) {
    const cacheKey = `user:username:${username}`;
    const cachedUser = getCached(cacheKey);
    if (cachedUser) return cachedUser;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (user) setCache(cacheKey, user);
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async createContact(insertContact) {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    cache.delete("all:contacts");
    return contact;
  }
  async getAllContacts() {
    const cacheKey = "all:contacts";
    const cachedContacts = getCached(cacheKey);
    if (cachedContacts) return cachedContacts;
    const allContacts = await db.select().from(contacts);
    setCache(cacheKey, allContacts);
    return allContacts;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json({
        message: "Contact form submitted successfully",
        id: contact.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Invalid form data",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Internal server error"
        });
      }
    }
  });
  app2.get("/api/contacts", async (req, res) => {
    try {
      const contacts2 = await storage.getAllContacts();
      res.json(contacts2);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch contacts"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost"
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom",
    optimizeDeps: {
      force: process.env.NODE_ENV === "production"
    }
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
import path3 from "path";
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
var PORT = process.env.PORT || 5e3;
var HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
app.set("trust proxy", 1);
if (process.env.NODE_ENV === "production") {
  const staticPath = path3.join(import.meta.dirname, "..", "dist", "public");
  app.use(express2.static(staticPath, {
    maxAge: "1y",
    etag: true,
    lastModified: true
  }));
}
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${message}`);
    res.status(status).json({ error: message });
  });
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  }
  server.listen(PORT, () => {
    log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
})();
