import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPG, PNG, WebP, GIF, MP4, and WebM files are allowed." },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name) || (file.type.startsWith("video/") ? ".mp4" : ".png");
  const uniqueName = `${crypto.randomUUID()}${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "projects");
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, uniqueName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/projects/${uniqueName}`;

  return NextResponse.json({ url: publicUrl });
}
