import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentMethodSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const methods = await prisma.paymentMethod.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ methods });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = paymentMethodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 }
    );
  }

  const method = await prisma.paymentMethod.create({ data: parsed.data });

  await prisma.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "CREATE_PAYMENT_METHOD",
      targetType: "PaymentMethod",
      targetId: method.id,
    },
  });

  return NextResponse.json({ method }, { status: 201 });
}
