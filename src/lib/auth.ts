// src/lib/auth.ts — NextAuth Configuration (JWT + Role-Based)

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, attach user data to token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach token data to session for client-side access
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ─── Type Augmentation for NextAuth ─────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "STUDENT" | "TEACHER" | "ADMIN";
      avatarUrl?: string | null;
    };
  }

  interface User {
    role: "STUDENT" | "TEACHER" | "ADMIN";
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    avatarUrl?: string | null;
  }
}