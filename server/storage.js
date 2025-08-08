"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("@shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
// Simple in-memory cache implementation
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
function getCached(key) {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
        return item.data;
    }
    cache.delete(key);
    return undefined;
}
function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}
class DatabaseStorage {
    async getUser(id) {
        const cacheKey = `user:${id}`;
        const cachedUser = getCached(cacheKey);
        if (cachedUser)
            return cachedUser;
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        if (user)
            setCache(cacheKey, user);
        return user || undefined;
    }
    async getUserByUsername(username) {
        const cacheKey = `user:username:${username}`;
        const cachedUser = getCached(cacheKey);
        if (cachedUser)
            return cachedUser;
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        if (user)
            setCache(cacheKey, user);
        return user || undefined;
    }
    async createUser(insertUser) {
        const [user] = await db_1.db
            .insert(schema_1.users)
            .values(insertUser)
            .returning();
        return user;
    }
    async createContact(insertContact) {
        const [contact] = await db_1.db
            .insert(schema_1.contacts)
            .values(insertContact)
            .returning();
        // Invalidate contacts cache when new contact is created
        cache.delete('all:contacts');
        return contact;
    }
    async getAllContacts() {
        const cacheKey = 'all:contacts';
        const cachedContacts = getCached(cacheKey);
        if (cachedContacts)
            return cachedContacts;
        const allContacts = await db_1.db.select().from(schema_1.contacts);
        setCache(cacheKey, allContacts);
        return allContacts;
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
