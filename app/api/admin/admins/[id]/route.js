import { NextResponse } from "next/server";
import {
  deleteAdminAccount,
  getCurrentAdmin,
  updateAdminAccount,
} from "@/lib/server/auth";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function PATCH(request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id } = await params;
    const admin = await updateAdminAccount(id, body);
    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update admin." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    await deleteAdminAccount(id, currentAdmin.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete admin." }, { status: 400 });
  }
}
