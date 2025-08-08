"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const storage_1 = require("./storage");
const schema_1 = require("@shared/schema");
const zod_1 = require("zod");
const nodemailer_1 = __importDefault(require("nodemailer"));
// Email transporter setup
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  Email credentials not configured. Email sending will be skipped.');
        return null;
    }
    console.log('📧 Setting up email transporter for:', process.env.EMAIL_USER);
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};
async function registerRoutes(app) {
    // Contact form submission
    app.post("/api/contact", async (req, res) => {
        try {
            const validatedData = schema_1.insertContactSchema.parse(req.body);
            const contact = await storage_1.storage.createContact(validatedData);
            // Send email notification
            const transporter = createTransporter();
            if (transporter) {
                try {
                    console.log('📤 Attempting to send email...');
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: 'jasemwaura@gmail.com',
                        subject: `Portfolio Contact: ${validatedData.subject}`,
                        html: `
              <h3>New Contact Form Submission</h3>
              <p><strong>Name:</strong> ${validatedData.name}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              <p><strong>Subject:</strong> ${validatedData.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Sent from your portfolio website</small></p>
            `,
                    };
                    await transporter.sendMail(mailOptions);
                    console.log('✅ Email sent successfully!');
                    res.json({
                        message: "Message sent successfully! I'll get back to you soon.",
                        id: contact.id
                    });
                }
                catch (emailError) {
                    console.error('❌ Failed to contact James, could you kindly write to him. Thank you for your patience:', emailError);
                    res.json({
                        message: "Message received! I'll get back to you soon.",
                        id: contact.id
                    });
                }
            }
            else {
                console.log('📝 Email not configured, message saved to database only');
                res.json({
                    message: "Message received! I'll get back to you soon.",
                    id: contact.id
                });
            }
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    message: "Invalid form data",
                    errors: error.errors
                });
            }
            else {
                console.error('Contact form error:', error);
                res.status(500).json({
                    message: "Failed to send message. Please try again."
                });
            }
        }
    });
    // Get all contacts (for admin purposes)
    app.get("/api/contacts", async (req, res) => {
        try {
            const contacts = await storage_1.storage.getAllContacts();
            res.json(contacts);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to fetch contacts"
            });
        }
    });
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
