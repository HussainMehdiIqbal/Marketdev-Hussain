import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const SOURCE_CODE_DIR = process.env.SOURCE_CODE_DIR || "./private-storage/source-code";
const PAYMENT_SCREENSHOTS_DIR =
  process.env.PAYMENT_SCREENSHOTS_DIR || "./private-storage/payment-screenshots";

const MAX_ZIP_BYTES = Number(process.env.MAX_ZIP_SIZE_MB || 500) * 1024 * 1024;
const MAX_SCREENSHOT_BYTES = Number(process.env.MAX_SCREENSHOT_SIZE_MB || 8) * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function safeExt(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Saves an uploaded ZIP (source code) to private storage.
 * Never write into /public — these files must not be reachable via a direct URL.
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

  await ensureDir(SOURCE_CODE_DIR);
  const uniqueName = `${crypto.randomUUID()}.zip`;
  const fullPath = path.join(SOURCE_CODE_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  // Return a relative path stored in the DB — never a public URL.
  return path.join(SOURCE_CODE_DIR, uniqueName);
}

/**
 * Saves a payment proof screenshot to private storage.
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

  await ensureDir(PAYMENT_SCREENSHOTS_DIR);
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const fullPath = path.join(PAYMENT_SCREENSHOTS_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return path.join(PAYMENT_SCREENSHOTS_DIR, uniqueName);
}

/** Reads a private file's bytes for a protected download/streaming endpoint. */
export async function readPrivateFile(storedPath: string): Promise<Buffer> {
  // Guard against path traversal — resolved path must stay inside the private storage roots.
  const resolved = path.resolve(storedPath);
  const allowedRoots = [path.resolve(SOURCE_CODE_DIR), path.resolve(PAYMENT_SCREENSHOTS_DIR)];
  if (!allowedRoots.some((root) => resolved.startsWith(root))) {
    throw new Error("Access denied: path outside private storage.");
  }
  return fs.readFile(resolved);
}
