import { NextResponse } from "next/server";
import {
  deleteBlogById,
  updateBlog,
} from "@/lib/server/content";
import { getCurrentAdmin } from "@/lib/server/auth";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function PATCH(request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id } = await params;
    const blog = await updateBlog(id, body);
    return NextResponse.json({ blog });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update blog." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    await deleteBlogById(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete blog." }, { status: 400 });
  }
}
