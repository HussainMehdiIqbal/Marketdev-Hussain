import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/** Generates a sequential, year-scoped order number like ORD-2026-000001. */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });

  const next = String(count + 1).padStart(6, "0");
  return `${prefix}${next}`;
}

/** Generates a unique license code like LIC-2026-A82F92. */
export function generateLicenseCode(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `LIC-${year}-${random}`;
}
