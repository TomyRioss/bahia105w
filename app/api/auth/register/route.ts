import { NextResponse } from "next/server";
import { pbAdmin, esc } from "@/lib/pocketbase";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, surname, email, password } = parsed.data;

    const pb = await pbAdmin();
    try {
      await pb.collection("users").getFirstListItem(`email="${esc(email)}"`);
      return NextResponse.json({ error: "Ese email ya está registrado." }, { status: 409 });
    } catch {
      // No existe, seguir.
    }

    await pb.collection("users").create({
      name, surname, email, emailVisibility: true,
      password, passwordConfirm: password, role: "USER",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Error al crear la cuenta." }, { status: 500 });
  }
}
