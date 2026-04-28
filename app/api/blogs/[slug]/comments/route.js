import { NextResponse } from "next/server";
import { addBlogComment } from "@/lib/server/content";

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { slug } = await params;
    const result = await addBlogComment(slug, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to post this comment." }, { status: 400 });
  }
}
