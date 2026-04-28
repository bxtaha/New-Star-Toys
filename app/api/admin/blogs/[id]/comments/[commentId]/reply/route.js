import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { addAdminReplyToComment } from "@/lib/server/content";

export async function POST(request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, commentId } = await params;
    const result = await addAdminReplyToComment(id, commentId, body, currentAdmin.name);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to add reply." }, { status: 400 });
  }
}
