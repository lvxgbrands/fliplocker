"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  issueAuthToken,
  consumeAuthToken,
  getCurrentUser,
} from "@/lib/auth";
import { sendEmail, verifyEmailTemplate, passwordResetTemplate } from "@/lib/email";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

async function sendVerificationEmail(userId: string, email: string) {
  const token = await issueAuthToken(userId, "EMAIL_VERIFY", 24);
  const { subject, html } = verifyEmailTemplate(`${appUrl()}/verify-email/${token}`);
  await sendEmail({ to: email, subject, html });
}

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/register?error=${encodeURIComponent("An account with that email already exists — sign in instead.")}`);
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: "SELLER" },
  });
  await sendVerificationEmail(user.id, email);
  await createSession(user.id);
  redirect("/dashboard?welcome=1");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "") || "/dashboard";

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect(`/login?error=${encodeURIComponent("Email or password is incorrect.")}&next=${encodeURIComponent(next)}`);
  }
  await createSession(user.id);
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function resendVerificationAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerified) await sendVerificationEmail(user.id, user.email);
  redirect("/dashboard?verification_sent=1");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const token = await issueAuthToken(user.id, "PASSWORD_RESET", 2);
    const { subject, html } = passwordResetTemplate(`${appUrl()}/reset-password/${token}`);
    await sendEmail({ to: email, subject, html });
  }
  // Same response either way — no account enumeration.
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    redirect(`/reset-password/${token}?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }
  const row = await consumeAuthToken(token, "PASSWORD_RESET");
  if (!row) {
    redirect(`/forgot-password?error=${encodeURIComponent("That reset link is invalid or expired — request a new one.")}`);
  }
  await db.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } });
  await db.session.deleteMany({ where: { userId: row.userId } });
  redirect("/login?reset=1");
}
