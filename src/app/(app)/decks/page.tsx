import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Mazzi" };

export default async function DecksPage() {
  const user = await requireUser();
  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Ciao{user.name ? `, ${user.name}` : ""}</h1>
      <p className="text-muted-foreground">
        Accesso effettuato come {user.email} (timezone: {user.timezone}).
      </p>
    </div>
  );
}
