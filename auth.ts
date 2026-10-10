import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import PocketBase from "pocketbase";
import { pbAdmin, esc, type PBUser } from "@/lib/pocketbase";
import { rateLimit } from "@/lib/rate-limit";

function pbPublic() {
  const url = process.env.POCKETBASE_URL;
  if (!url) throw new Error("Falta POCKETBASE_URL en el entorno.");
  return new PocketBase(url);
}

async function findUserByEmail(email: string) {
  const pb = await pbAdmin();
  try {
    return await pb.collection("users").getFirstListItem<PBUser>(`email="${esc(email)}"`);
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
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
        // Freno a fuerza bruta por cuenta (20 intentos / 10 min). Retorna null
        // genérico para no revelar si la cuenta existe.
        if (!rateLimit(`login:${email.toLowerCase()}`, 20, 10 * 60 * 1000)) return null;

        try {
          const pb = pbPublic();
          const rec = await pb.collection("users").authWithPassword(email, password);
          const u = rec.record as unknown as PBUser;
          return {
            id: u.id,
            name: u.name,
            surname: u.surname,
            email: u.email,
            image: u.image,
            role: u.role ?? "USER",
          };
        } catch {
          // Fallback: usuarios migrados de Postgres (hash bcrypt heredado).
          try {
            const pb = await pbAdmin();
            const u = await pb.collection("users").getFirstListItem<
              PBUser & { legacyHash?: string }
            >(`email="${esc(email)}"`);
            if (!u.legacyHash) return null;
            const valid = await bcrypt.compare(password, u.legacyHash);
            if (!valid) return null;
            // Adoptar el password en PB y soltar el hash heredado.
            await pb.collection("users").update(u.id, {
              password, passwordConfirm: password, legacyHash: null,
            });
            return {
              id: u.id, name: u.name, surname: u.surname,
              email: u.email, image: u.image, role: u.role ?? "USER",
            };
          } catch {
            return null;
          }
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user && account?.provider === "google" && user.email) {
        // Resolver identidad de Google contra el usuario de PocketBase.
        let pbUser = await findUserByEmail(user.email);
        if (!pbUser) {
          const pb = await pbAdmin();
          const randomPass = `${crypto.randomUUID()}${crypto.randomUUID()}`;
          pbUser = await pb.collection("users").create<PBUser>({
            email: user.email,
            emailVisibility: true,
            verified: true,
            password: randomPass,
            passwordConfirm: randomPass,
            name: user.name ?? null,
            surname: (user as { surname?: string | null }).surname ?? null,
            image: user.image ?? null,
            role: "USER",
          });
        }
        token.sub = pbUser.id;
        token.role = pbUser.role;
        token.surname = pbUser.surname;
        return token;
      }
      if (user) {
        token.role = (user as { role?: string }).role;
        token.surname = (user as { surname?: string | null }).surname;
      }
      // Refrescar rol en cada request: si un admin es degradado, pierde el acceso
      // al renovarse la sesión en vez de conservarlo hasta que expire el JWT.
      if (token.sub) {
        const pbUser = await findUserByEmail(token.email ?? "");
        const byId =
          pbUser ??
          (await (async () => {
            try {
              const pb = await pbAdmin();
              return await pb.collection("users").getOne<PBUser>(token.sub as string);
            } catch {
              return null;
            }
          })());
        token.role = byId?.role;
        token.surname = byId?.surname;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.surname = token.surname as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
