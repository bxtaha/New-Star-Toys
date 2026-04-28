import { NextResponse } from "next/server";
import {
  createProduct,
  listProductsForAdmin,
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

  const products = await listProductsForAdmin();
  return NextResponse.json({ products });
}

export async function POST(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const product = await createProduct(body);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to create product." }, { status: 400 });
  }
}
