import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: list only enabled payment methods for checkout.
export async function GET() {
  const methods = await prisma.paymentMethod.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      accountHolder: true,
      bankOrWallet: true,
      accountNumber: true,
      iban: true,
      instructions: true,
      qrCodeUrl: true,
    },
  });

  return NextResponse.json({ methods });
}
