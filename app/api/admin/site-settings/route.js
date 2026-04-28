import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/server/content";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const settings = await updateSiteSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to update settings." }, { status: 400 });
  }
}

export async function DELETE(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const url = new URL(request.url);
    const pageKey = url.searchParams.get("pageKey") || "";
    const removeHeroImageUrl = url.searchParams.get("heroImageUrl") || "";
    const settings = await updateSiteSettings({ pageKey, removeHeroImageUrl });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to delete hero image." }, { status: 400 });
  }
}
