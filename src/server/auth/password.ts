import "server-only";
import { hash, verify } from "@node-rs/argon2";

// OWASP-recommended argon2id baseline (m=19 MiB, t=2, p=1).
const OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/**
 * A valid hash of a random string, used to equalize timing when the user
 * does not exist (prevents user enumeration via response time).
 */
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(crypto.randomUUID());
  return dummyHash;
}
