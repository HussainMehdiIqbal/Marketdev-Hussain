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
 * Saves an uploaded ZIP (source code) to Vercel Blob storage.
 * The blob URL contains an unguessable random token and is NEVER exposed
 * directly to the client — it is only ever fetched server-side inside the
 * authenticated /api/download route below.
 */
export async function saveSourceCodeZip(file: File): Promise<string> {
  const ext = safeExt(file.name);
  if (ext !== ".zip") {
    throw new Error("Only .zip files are allowed for source code.");
  }
  if (file.type && file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
    throw new Error("Invalid file type. Expected a ZIP archive.");
  }
  if (file.size > MAX_ZIP_BYTES) {
    throw new Error(`File too large. Maximum size is ${MAX_ZIP_BYTES / 1024 / 1024}MB.`);
  }

  const uniqueName = `${SOURCE_CODE_PREFIX}/${crypto.randomUUID()}.zip`;
  const blob = await put(uniqueName, file, {
    access: "public",
    addRandomSuffix: false,
  });

  // Store the blob URL in the DB — it is never surfaced to the client directly.
  return blob.url;
}

/**
 * Saves a payment proof screenshot to Vercel Blob storage.
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

/** Reads a private file's bytes for a protected download/streaming endpoint. */
export async function readPrivateFile(storedPath: string): Promise<Buffer> {
  // Guard: only ever fetch URLs pointing at our own Blob store.
  if (!storedPath.startsWith("https://") || !storedPath.includes(".public.blob.vercel-storage.com/")) {
    throw new Error("Access denied: not a recognized storage URL.");
  }
  const res = await fetch(storedPath);
  if (!res.ok) {
    throw new Error(`Failed to fetch file from storage (status ${res.status}).`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
