import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
};

/**
 * Data Access Layer entry point: verifies the session *and* that the user
 * still exists. Memoized per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const [user] = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For route handlers: returns null instead of redirecting. */
export async function getApiUser(): Promise<CurrentUser | null> {
  return getCurrentUser();
}
