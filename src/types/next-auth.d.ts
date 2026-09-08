import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "super_admin" | "admin" | "editor" | "creator";
    status?: "active" | "inactive";
  }

  interface Session {
    user: {
      id: string;
      role?: "super_admin" | "admin" | "editor" | "creator";
      status?: "active" | "inactive";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "super_admin" | "admin" | "editor" | "creator";
    status?: "active" | "inactive";
  }
}
