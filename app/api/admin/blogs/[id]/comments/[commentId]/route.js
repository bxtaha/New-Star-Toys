import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { deleteCommentById } from "@/lib/server/content";

export async function DELETE(_request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id, commentId } = await params;
    const result = await deleteCommentById(id, commentId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete comment." }, { status: 400 });
  }
}
