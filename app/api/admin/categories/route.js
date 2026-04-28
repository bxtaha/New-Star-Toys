import { NextResponse } from "next/server";
import {
  createCategory,
  listCategoriesForAdmin,
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

  const categories = await listCategoriesForAdmin();
  return NextResponse.json({ categories });
}

export async function POST(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const category = await createCategory(body);
    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to create category." }, { status: 400 });
  }
}
