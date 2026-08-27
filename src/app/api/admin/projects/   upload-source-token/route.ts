
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { SOURCE_CODE_ALLOWED_TYPES, PRIVATE_TOKEN, MAX_ZIP_BYTES } from "@/lib/storage";

export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      token: PRIVATE_TOKEN,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: SOURCE_CODE_ALLOWED_TYPES,
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_ZIP_BYTES,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client finalizes by calling upload-source with the URL.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
