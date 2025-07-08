import { users, contacts, type User, type InsertUser, type Contact, type InsertContact } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
}

// Simple in-memory cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function getCached<T>(key: string): T | undefined {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data as T;
  }
  cache.delete(key);
  return undefined;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const cacheKey = `user:${id}`;
    const cachedUser = getCached<User>(cacheKey);
    if (cachedUser) return cachedUser;

    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) setCache(cacheKey, user);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const cacheKey = `user:username:${username}`;
    const cachedUser = getCached<User>(cacheKey);
    if (cachedUser) return cachedUser;

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (user) setCache(cacheKey, user);
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    
    // Invalidate contacts cache when new contact is created
    cache.delete('all:contacts');
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    const cacheKey = 'all:contacts';
    const cachedContacts = getCached<Contact[]>(cacheKey);
    if (cachedContacts) return cachedContacts;

    const allContacts = await db.select().from(contacts);
    setCache(cacheKey, allContacts);
    return allContacts;
  }
}

export const storage = new DatabaseStorage();
