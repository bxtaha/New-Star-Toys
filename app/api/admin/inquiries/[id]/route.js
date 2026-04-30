import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { deleteInquiryForAdmin, getInquiryForAdmin, updateInquiryStatus } from "@/lib/server/inquiries";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET(request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const inquiry = await getInquiryForAdmin(id);
  if (!inquiry) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ inquiry });
}

export async function PATCH(request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateInquiryStatus({ inquiryId: id, status: body?.status });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update inquiry." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const result = await deleteInquiryForAdmin(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete inquiry." }, { status: 400 });
  }
}
