import { NextResponse } from "next/server";
import { normalizeLanguage } from "@/lib/i18n";

const COOKIE_NAME = "ycnst_lang";

export async function POST(request) {
  try {
    const body = await request.json();
    const lang = normalizeLanguage(body?.lang);
    const response = NextResponse.json({ success: true, lang });
    response.cookies.set(COOKIE_NAME, lang, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
    return response;
  } catch {
    const response = NextResponse.json({ success: false }, { status: 400 });
    return response;
  }
}

