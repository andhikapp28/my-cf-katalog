import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";
import { loginSchema } from "@/lib/validators";
import { ensureAdminUser } from "@/lib/bootstrap";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await ensureAdminUser();

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const [{ db }, schemaModule, drizzleModule] = await Promise.all([
          import("@/db"),
          import("@/db/schema"),
          import("drizzle-orm")
        ]);
        const { users } = schemaModule;
        const { eq } = drizzleModule;

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email)
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role
        };
      }
    })
  ]
});
