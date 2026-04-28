import { NextResponse } from "next/server";
import {
  createBlog,
  listBlogsForAdmin,
} from "@/lib/server/content";
import { getCurrentAdmin } from "@/lib/server/auth";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  const blogs = await listBlogsForAdmin();
  return NextResponse.json({ blogs });
}

export async function POST(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const blog = await createBlog(body);
    return NextResponse.json({ blog });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to create blog." }, { status: 400 });
  }
}
