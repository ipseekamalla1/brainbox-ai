// types/next-auth.d.ts
// Add this file if it doesn't already exist.
// All the new API routes check session.user.role and session.user.id —
// without this, TypeScript will complain those properties don't exist.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "STUDENT" | "TEACHER" | "ADMIN";
    };
  }

  interface User {
    id: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
  }
}