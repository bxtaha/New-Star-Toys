import { NextResponse } from "next/server";
import { getHeroSettings } from "@/lib/server/content";

export async function GET(request) {
  const url = new URL(request.url);
  const pageKey = url.searchParams.get("pageKey") || "home";
  const lang = url.searchParams.get("lang") || "";
  const hero = await getHeroSettings(pageKey, lang);
  return NextResponse.json({ hero });
}
