import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Email non valida" }))
  .refine((v) => v.length <= 254, "Email troppo lunga");

export const passwordSchema = z
  .string()
  .min(8, "La password deve avere almeno 8 caratteri")
  .max(128, "La password può avere al massimo 128 caratteri");

export const timezoneSchema = z
  .string()
  .max(64)
  .refine((tz) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Timezone non valida");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password obbligatoria").max(128),
});

export const registerSchema = z
  .object({
    name: z.string().trim().max(80).optional().transform((v) => v || undefined),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    timezone: timezoneSchema.catch("UTC"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Le password non coincidono",
  });

export type FieldErrors = Partial<Record<string, string[]>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
