import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns categories + technologies together — used by filter bars and admin project forms.
export async function GET() {
  const [categories, technologies] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.technology.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ categories, technologies });
}
