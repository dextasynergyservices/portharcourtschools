import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db, users } from "@/lib/db";
import { checkLoginRateLimit } from "@/lib/ratelimit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "production"
    ? undefined
    : "phs_auth_secret_dev_key_2026_super_secure_admin_jwt");

if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "CRITICAL SECURITY CONFIGURATION: AUTH_SECRET or NEXTAUTH_SECRET is required in production.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Brute-force protection: Max 5 attempts per 15 minutes per email/identifier
        const rateCheck = await checkLoginRateLimit(normalizedEmail);
        if (!rateCheck.success) {
          throw new Error(
            "Too many login attempts. Please wait 15 minutes before trying again.",
          );
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (!user || !user.passwordHash) {
          return null;
        }

        if (user.status !== "active") {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.status = (user as { status?: string }).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // @ts-expect-error Custom auth properties
        session.user.role = token.role as string;
        // @ts-expect-error Custom auth properties
        session.user.status = token.status as string;
      }
      return session;
    },
  },
});
