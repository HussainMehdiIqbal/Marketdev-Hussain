import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentMethodSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ methodId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { methodId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = paymentMethodSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 }
    );
  }

  const method = await prisma.paymentMethod.update({
    where: { id: methodId },
    data: parsed.data,
  });

  return NextResponse.json({ method });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ methodId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { methodId } = await params;
  await prisma.paymentMethod.delete({ where: { id: methodId } });

  return NextResponse.json({ success: true });
}
