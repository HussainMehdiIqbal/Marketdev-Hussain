import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readPrivateFile } from "@/lib/storage";

// Protected download endpoint. A download is only ever permitted when ALL of
// the following hold: authenticated user + verified payment + user owns the order.
// This route is the ONLY way source code ZIPs leave private storage — there is
// no public URL to the file.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { project: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Ownership check.
  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Payment verification check — VERIFIED or COMPLETED only.
  if (!["VERIFIED", "COMPLETED"].includes(order.status)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!order.project.sourceCodePath) {
    return NextResponse.json({ error: "Source code is not yet available for this project." }, { status: 404 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readPrivateFile(order.project.sourceCodePath);
  } catch (err) {
    console.error("Download read error:", err);
    return NextResponse.json({ error: "Unable to read file." }, { status: 500 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;

  await prisma.$transaction([
    prisma.download.create({
      data: {
        userId: session.user.id,
        projectId: order.projectId,
        orderId: order.id,
        ipAddress: ip,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED" },
    }),
  ]);

  const filename = `${order.project.slug}-v${order.project.version}.zip`;

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "no-store",
    },
  });
}
