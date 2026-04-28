import { NextResponse } from "next/server";
import { ensureDefaultAdmin } from "@/lib/server/auth";

function isSeedAuthorized(request) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const expectedKey = String(process.env.ADMIN_SEED_API_KEY || "").trim();
  if (!expectedKey) {
    return false;
  }

  const providedKey = String(request.headers.get("x-seed-key") || "").trim();
  if (providedKey && providedKey === expectedKey) {
    return true;
  }

  const url = new URL(request.url);
  const queryKey = String(url.searchParams.get("key") || "").trim();
  return queryKey && queryKey === expectedKey;
}

async function seedHandler(request) {
  try {
    if (!isSeedAuthorized(request)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const admin = await ensureDefaultAdmin();
    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to seed admin." }, { status: 500 });
  }
}

export async function GET(request) {
  return seedHandler(request);
}

export async function POST(request) {
  return seedHandler(request);
}
