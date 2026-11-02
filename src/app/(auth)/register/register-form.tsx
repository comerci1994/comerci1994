"use client";

import Link from "next/link";
import { useActionState, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { registerAction, type AuthFormState } from "../actions";

const subscribe = () => () => {};
const getTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(registerAction, {});
  const timezone = useSyncExternalStore(subscribe, getTz, () => "UTC");
  const fe = state.fieldErrors ?? {};

  const inputProps = (name: string) => ({
    id: name,
    name,
    "aria-invalid": !!fe[name],
    "aria-describedby": fe[name] ? `${name}-error` : undefined,
  });

  return (
    <form action={action} className="grid gap-4" noValidate>
      {state.error && <Alert variant="error">{state.error}</Alert>}
      <input type="hidden" name="timezone" value={timezone} />
      <Field id="name" label="Nome (opzionale)" error={fe.name}>
        <Input {...inputProps("name")} autoComplete="name" defaultValue={state.values?.name} />
      </Field>
      <Field id="email" label="Email" error={fe.email}>
        <Input
          {...inputProps("email")}
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
        />
      </Field>
      <Field id="password" label="Password" error={fe.password} hint="Almeno 8 caratteri.">
        <Input {...inputProps("password")} type="password" autoComplete="new-password" required />
      </Field>
      <Field id="confirmPassword" label="Conferma password" error={fe.confirmPassword}>
        <Input
          {...inputProps("confirmPassword")}
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="animate-spin" />} Crea account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
