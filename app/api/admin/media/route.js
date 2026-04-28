import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { listMediaForAdmin, canDeleteMediaUrl } from "@/lib/server/media";
import { deleteManagedUpload } from "@/lib/server/uploads";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "60";
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const kind = searchParams.get("kind") || "";
  const folder = searchParams.get("folder") || "";

  const result = await listMediaForAdmin({ page, pageSize, query, status, kind, folder });
  return NextResponse.json(result);
}

export async function DELETE(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const url = body?.url;
    const check = await canDeleteMediaUrl(url);
    if (!check.allowed) {
      return NextResponse.json({ error: check.used ? "This file is in use." : "Invalid media url." }, { status: 400 });
    }
    await deleteManagedUpload(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete media." }, { status: 400 });
  }
}

