"use server";

import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/password";
import { clientIp, formatRetry, rateLimit } from "@/server/rate-limit";
import {
  fieldErrors,
  loginSchema,
  registerSchema,
  type FieldErrors,
} from "@/lib/validation";
import { safeCallbackUrl } from "@/lib/utils";

export type AuthFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
  values?: { email?: string; name?: string };
};

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values: { email } };
  }

  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`login:ip:${ip}`, 30, 15 * 60_000),
    rateLimit(`login:email:${parsed.data.email}`, 10, 15 * 60_000),
  ]);
  const limited = [byIp, byEmail].find((r) => !r.ok);
  if (limited && !limited.ok) {
    return {
      error: `Troppi tentativi di accesso. Riprova tra ${formatRetry(limited.retryAfterSec)}.`,
      values: { email },
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Email o password non corretti."
            : "Accesso non riuscito. Riprova.",
        values: { email },
      };
    }
    throw error; // NEXT_REDIRECT on success
  }
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
  };
  const parsed = registerSchema.safeParse({
    name: formData.get("name") ?? undefined,
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values };
  }

  const ip = await clientIp();
  const limit = await rateLimit(`register:ip:${ip}`, 5, 60 * 60_000);
  if (!limit.ok) {
    return {
      error: `Troppe registrazioni da questa rete. Riprova tra ${formatRetry(limit.retryAfterSec)}.`,
      values,
    };
  }

  const db = getDb();
  const { email, password, name, timezone } = parsed.data;
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { fieldErrors: { email: ["Email già registrata"] }, values };
  }

  try {
    await db.insert(users).values({
      email,
      name: name ?? null,
      timezone,
      passwordHash: await hashPassword(password),
    });
  } catch (error) {
    if (String(error).includes("UNIQUE")) {
      return { fieldErrors: { email: ["Email già registrata"] }, values };
    }
    console.error("register failed", error);
    return { error: "Registrazione non riuscita. Riprova.", values };
  }

  await signIn("credentials", { email, password, redirectTo: "/decks" });
  return {};
}
