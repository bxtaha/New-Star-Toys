import { NextResponse } from "next/server";
import path from "path";
import { readManagedUpload } from "@/lib/server/uploads";

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function getContentType(filePath) {
  const ext = path.extname(filePath || "").toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

function notFound() {
  return new NextResponse("Not Found", { status: 404 });
}

export async function GET(request, { params }) {
  const segments = (await params)?.path || [];
  if (!Array.isArray(segments) || segments.length === 0) {
    return notFound();
  }

  const relative = segments.join("/");
  if (!relative || relative.includes("\0")) {
    return notFound();
  }

  try {
    const buffer = await readManagedUpload(relative);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(relative),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return notFound();
  }
}

export async function HEAD(request, context) {
  const response = await GET(request, context);
  if (response.status !== 200) {
    return response;
  }
  return new NextResponse(null, { status: 200, headers: response.headers });
}
