import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema } from "./validation";
import { safeCallbackUrl } from "./utils";

describe("registerSchema", () => {
  const base = {
    email: "  Mario@Example.COM ",
    password: "supersecret",
    confirmPassword: "supersecret",
    timezone: "Europe/Rome",
  };

  it("normalizes email and accepts valid input", () => {
    const r = registerSchema.parse(base);
    expect(r.email).toBe("mario@example.com");
    expect(r.timezone).toBe("Europe/Rome");
    expect(r.name).toBeUndefined();
  });

  it("rejects mismatched passwords", () => {
    const r = registerSchema.safeParse({ ...base, confirmPassword: "different" });
    expect(r.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const r = registerSchema.safeParse({ ...base, password: "short", confirmPassword: "short" });
    expect(r.success).toBe(false);
  });

  it("falls back to UTC on invalid timezone", () => {
    expect(registerSchema.parse({ ...base, timezone: "Mars/Olympus" }).timezone).toBe("UTC");
  });
});

describe("loginSchema", () => {
  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
});

describe("safeCallbackUrl", () => {
  it.each([
    ["/decks/1", "/decks/1"],
    ["//evil.com", "/decks"],
    ["https://evil.com", "/decks"],
    ["/\\evil.com", "/decks"],
    [null, "/decks"],
  ])("%s -> %s", (input, expected) => {
    expect(safeCallbackUrl(input)).toBe(expected);
  });
});
