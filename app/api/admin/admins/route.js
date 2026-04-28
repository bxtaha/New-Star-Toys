import { NextResponse } from "next/server";
import {
  createAdminAccount,
  getCurrentAdmin,
  listAdmins,
} from "@/lib/server/auth";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  const admins = await listAdmins();
  return NextResponse.json({ admins });
}

export async function POST(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const admin = await createAdminAccount(body);
    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to create admin." }, { status: 400 });
  }
}
