import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ?? profile.name,
          surname: profile.family_name ?? null,
          email: profile.email,
          image: profile.picture,
          role: "USER",
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.surname = (user as { surname?: string | null }).surname;
      }
      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
        token.role = dbUser?.role;
        token.surname = dbUser?.surname;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.surname = token.surname;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
