import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "change-me-now";
const OTP_MINUTES = 10;

export type AdminUser = {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  is_active: boolean;
};

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(code: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(code)
    .digest("hex");
}

export function makeSessionToken(adminId: string): string {
  const payload = `${adminId}.${Date.now()}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [adminId, timestamp, signature] = parts;
  if (!adminId || !timestamp || !signature) return false;

  const payload = `${adminId}.${timestamp}`;
  const expected = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function findAdminByUsername(username: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data as AdminUser | null;
}

export async function verifyAdminPassword(
  plainPassword: string,
  passwordHash: string
) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function createOtpRecord(adminUserId: string, code: string) {
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_MINUTES * 60 * 1000).toISOString();

  await supabase
    .from("admin_otps")
    .update({ used: true })
    .eq("admin_user_id", adminUserId)
    .eq("used", false);

  const { error } = await supabase.from("admin_otps").insert({
    admin_user_id: adminUserId,
    code_hash: codeHash,
    expires_at: expiresAt,
    used: false,
  });

  if (error) throw error;
}

export async function verifyOtpCode(adminUserId: string, code: string) {
  const codeHash = hashOtp(code);

  const { data, error } = await supabase
    .from("admin_otps")
    .select("*")
    .eq("admin_user_id", adminUserId)
    .eq("code_hash", codeHash)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;

  const expiresAt = new Date(data.expires_at).getTime();
  if (Date.now() > expiresAt) return false;

  const { error: updateError } = await supabase
    .from("admin_otps")
    .update({ used: true })
    .eq("id", data.id);

  if (updateError) throw updateError;

  return true;
}