import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

const SOURCE_CODE_PREFIX = "source-code";
const PAYMENT_SCREENSHOTS_PREFIX = "payment-screenshots";

const MAX_ZIP_BYTES = Number(process.env.MAX_ZIP_SIZE_MB || 500) * 1024 * 1024;
const MAX_SCREENSHOT_BYTES = Number(process.env.MAX_SCREENSHOT_SIZE_MB || 8) * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];

function safeExt(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Saves a payment proof screenshot to Vercel Blob storage.
 * Screenshots are small, so this still goes straight through the server.
 */
export async function savePaymentScreenshot(file: File): Promise<string> {
  const ext = safeExt(file.name);
  if (!ALLOWED_IMAGE_EXT.includes(ext)) {
    throw new Error("Only JPG, JPEG, PNG and WebP screenshots are allowed.");
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid image type.");
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    throw new Error(`Screenshot too large. Maximum size is ${MAX_SCREENSHOT_BYTES / 1024 / 1024}MB.`);
  }

  const uniqueName = `${PAYMENT_SCREENSHOTS_PREFIX}/${crypto.randomUUID()}${ext}`;
  const blob = await put(uniqueName, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

/** Config shared with the client-direct upload token route for source ZIPs. */
export const SOURCE_CODE_ALLOWED_TYPES = ["application/zip", "application/x-zip-compressed"];
export { SOURCE_CODE_PREFIX, MAX_ZIP_BYTES };

/** Reads a private file's bytes for a protected download/streaming endpoint. */
export async function readPrivateFile(storedPath: string): Promise<Buffer> {
  // Guard: only ever fetch URLs pointing at our own Blob store.
  if (!storedPath.startsWith("https://") || !storedPath.includes(".blob.vercel-storage.com/")) {
    throw new Error("Access denied: not a recognized storage URL.");
  }
  const res = await fetch(storedPath);
  if (!res.ok) {
    throw new Error(`Failed to fetch file from storage (status ${res.status}).`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
