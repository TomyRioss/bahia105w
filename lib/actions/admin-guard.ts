import "server-only";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    throw new Error("No autorizado.");
  }
  return session;
}

export async function requireOwner() {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    throw new Error("No autorizado.");
  }
  return session;
}
