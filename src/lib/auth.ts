import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { hasAdminAccess, hasProtectedBAccess } from "@/lib/protected-policy";
import { logAuditEvent } from "./audit-logger";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          await logAuditEvent({
            userId: "anonymous",
            userEmail: credentials.email,
            action: "LOGIN_FAILED",
            details: { reason: "User not found" }
          });
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          await logAuditEvent({
            userId: user.id,
            userEmail: user.email,
            action: "LOGIN_FAILED",
            details: { reason: "Incorrect password" }
          });
          return null;
        }

        await logAuditEvent({
          userId: user.id,
          userEmail: user.email,
          action: "LOGIN",
          details: { email: user.email }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          protectedBAccess: hasProtectedBAccess(user.email, user.protectedBAccess, user.role),
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.protectedBAccess = user.protectedBAccess;
      }

      token.adminAccess = hasAdminAccess(token.email, token.role);
      token.protectedBAccess = hasProtectedBAccess(token.email, Boolean(token.protectedBAccess), token.role);
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name;
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.protectedBAccess = Boolean(token.protectedBAccess);
        session.user.adminAccess = Boolean(token.adminAccess);
      }
      return session;
    }
  }
};
