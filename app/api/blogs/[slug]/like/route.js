import { NextResponse } from "next/server";
import { decrementBlogLike, incrementBlogLike } from "@/lib/server/content";

export async function POST(_request, { params }) {
  try {
    const { slug } = await params;
    const result = await incrementBlogLike(slug);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to like this blog post." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { slug } = await params;
    const result = await decrementBlogLike(slug);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to remove like from this blog post." }, { status: 400 });
  }
}
