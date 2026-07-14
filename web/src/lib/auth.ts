import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { AuthTokenKind, Role, User } from "@prisma/client";

const SESSION_COOKIE = "fl_session";
const SESSION_DAYS = 30;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
    jar.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** Server-component guard: redirects to /login when signed out, or home when the role doesn't match. */
export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role && user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function issueAuthToken(userId: string, kind: AuthTokenKind, hours: number): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await db.authToken.create({
    data: { token, kind, userId, expiresAt: new Date(Date.now() + hours * 3600 * 1000) },
  });
  return token;
}

/** Returns the token row if valid and unused, consuming it; null otherwise. */
export async function consumeAuthToken(token: string, kind: AuthTokenKind) {
  const row = await db.authToken.findUnique({ where: { token }, include: { user: true } });
  if (!row || row.kind !== kind || row.usedAt || row.expiresAt < new Date()) return null;
  await db.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return row;
}
