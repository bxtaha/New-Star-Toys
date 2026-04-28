import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/server/inquiries";
import { getRequestLanguage } from "@/lib/server/request-language";

function getSourcePath(request) {
  const referer = request.headers.get("referer");
  if (!referer) {
    return "";
  }
  try {
    return new URL(referer).pathname || "";
  } catch {
    return "";
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const language = await getRequestLanguage();
    const sourcePath = getSourcePath(request);
    const result = await createInquiry(body, { language, sourcePath });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to submit inquiry." }, { status: 400 });
  }
}
