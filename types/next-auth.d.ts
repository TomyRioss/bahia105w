import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      surname?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    surname?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    surname?: string | null;
  }
}
