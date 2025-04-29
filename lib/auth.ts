import { hash, compare } from 'bcryptjs';
import { db } from './db';
import { usersTable } from './db/schema';
import { eq } from 'drizzle-orm';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, username: string, name: string) {
  const hashedPassword = await hashPassword(password);
  
  const user = await db.insert(usersTable).values({
    email,
    password: hashedPassword,
    username,
    name,
    createdAt: new Date().toISOString(),
  }).returning();

  return user[0];
}

export async function findUserByEmail(email: string) {
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
  return users[0];
}

export async function findUserByUsername(username: string) {
  const users = await db.select().from(usersTable).where(eq(usersTable.username, username));
  return users[0];
} 