import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";
import { chat, type ChatMessage } from "./api/conversation";
import { processCommand } from "./api/command";
import { contactRateLimit, chatRateLimit } from "./middleware/rateLimit";

// ─── Email transporter ────────────────────────────────────────────────────────
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  Email credentials not configured. Email sending will be skipped.");
    return null;
  }
  console.log("📧 Setting up email transporter for:", process.env.EMAIL_USER);
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Routes ───────────────────────────────────────────────────────────────────
export async function registerRoutes(app: Express): Promise<Server> {

  // POST /api/contact — contact form submission forwarded to Gmail
  app.post("/api/contact", contactRateLimit, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      const transporter = createTransporter();

      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "jasemwaura@gmail.com",
            subject: `Portfolio Contact: ${validatedData.subject}`,
            html: `
              <h3>New Contact Form Submission</h3>
              <p><strong>Name:</strong> ${validatedData.name}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              <p><strong>Subject:</strong> ${validatedData.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${validatedData.message.replace(/\n/g, "<br>")}</p>
              <hr>
              <p><small>Sent from your portfolio website</small></p>
            `,
          });
          console.log("✅ Email sent successfully!");
          res.json({
            message: "Message sent successfully! I'll get back to you soon.",
            id: contact.id,
          });
        } catch (emailError) {
          console.error("❌ Failed to send email:", emailError);
          res.json({
            message: "Message received! I'll get back to you soon.",
            id: contact.id,
          });
        }
      } else {
        console.log("📝 Email not configured, message saved to database only");
        res.json({
          message: "Message received! I'll get back to you soon.",
          id: contact.id,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ message: "Failed to send message. Please try again." });
      }
    }
  });

  // GET /api/contacts — admin: list all contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/chat", chatRateLimit, async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }

      // Keep only role + content, max 20 messages for context window
      const sanitized: ChatMessage[] = messages
        .slice(-20)
        .filter((m) => m && typeof m.role === "string" && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await chat(sanitized);
      res.json({ reply });
    } catch (error) {
      console.error("Chat route error:", error);
      res.status(500).json({ error: "Failed to generate response. Please try again." });
    }
  });

  // POST /api/command - AI Terminal Command Processor
  app.post("/api/command", chatRateLimit, async (req, res) => {
    try {
      const { command } = req.body;
      if (!command || typeof command !== "string") {
        res.status(400).json({ error: "command string is required" });
        return;
      }
      
      const response = await processCommand(command);
      res.json(response);
    } catch (error) {
      console.error("Command route error:", error);
      res.status(500).json({ action: "UNKNOWN", message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
