import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Accedi" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accedi</CardTitle>
        <CardDescription>Bentornato. Inserisci le tue credenziali.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} />
      </CardContent>
    </Card>
  );
}
