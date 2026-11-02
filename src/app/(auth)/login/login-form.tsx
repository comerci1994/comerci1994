"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { loginAction, type AuthFormState } from "../actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(loginAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="grid gap-4" noValidate>
      {state.error && <Alert variant="error">{state.error}</Alert>}
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <Field id="email" label="Email" error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={!!fe.email}
          aria-describedby={fe.email ? "email-error" : undefined}
        />
      </Field>
      <Field id="password" label="Password" error={fe.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!fe.password}
          aria-describedby={fe.password ? "password-error" : undefined}
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="animate-spin" />} Accedi
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Non hai un account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Registrati
        </Link>
      </p>
    </form>
  );
}
