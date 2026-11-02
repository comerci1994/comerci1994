import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { getDummyHash, verifyPassword } from "@/server/auth/password";
import { loginSchema } from "@/lib/validation";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

export class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: true,
  logger: {
    error(error) {
      // Wrong credentials are expected user errors, not server errors.
      if ((error as { type?: string }).type === "CredentialsSignin") return;
      console.error("[auth]", error);
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) throw new InvalidCredentials();
        const { email, password } = parsed.data;

        const [user] = await getDb()
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        // Always run a verification to keep timing constant.
        const ok = await verifyPassword(
          user?.passwordHash ?? (await getDummyHash()),
          password,
        );
        if (!user || !ok) throw new InvalidCredentials();

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
