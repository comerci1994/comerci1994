import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Registrati" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crea un account</CardTitle>
        <CardDescription>Inizia a generare e ripassare flashcard.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
