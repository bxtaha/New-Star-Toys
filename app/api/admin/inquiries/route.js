import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { listInquiriesForAdmin } from "@/lib/server/inquiries";

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
  const pageSize = searchParams.get("pageSize") || "20";
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  const result = await listInquiriesForAdmin({ page, pageSize, query, status });
  return NextResponse.json(result);
}

