"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertContactSchema = exports.insertUserSchema = exports.contacts = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
});
exports.contacts = (0, pg_core_1.pgTable)("contacts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    subject: (0, pg_core_1.text)("subject").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
});
exports.insertContactSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contacts).pick({
    name: true,
    email: true,
    subject: true,
    message: true,
});
