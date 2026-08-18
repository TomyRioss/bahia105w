import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminUserForm } from "@/components/admin/user-form";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user.role !== "OWNER") redirect("/admin");

  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "OWNER"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl">Usuarios</h1>

      <div className="rounded-lg border border-foreground/10 p-4">
        <p className="mb-4 text-sm font-medium">Crear nuevo admin</p>
        <AdminUserForm />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Alta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell className="text-foreground/60">{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell className="text-foreground/60">
                {u.createdAt.toLocaleDateString("es-MX")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
