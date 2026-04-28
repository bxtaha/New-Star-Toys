import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { addInquiryReply } from "@/lib/server/inquiries";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function POST(request, { params }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await addInquiryReply({
      inquiryId: id,
      admin: currentAdmin,
      subject: body?.subject,
      message: body?.message,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to send reply." }, { status: 400 });
  }
}

