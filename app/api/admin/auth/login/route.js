import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  authenticateAdmin,
  createAdminSession,
  getSessionCookieOptions,
} from "@/lib/server/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const admin = await authenticateAdmin(body.email, body.password);

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const session = await createAdminSession(admin.id);
    const response = NextResponse.json({ admin });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      session.token,
      getSessionCookieOptions(session.expiresAt, request),
    );

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to sign in." }, { status: 500 });
  }
}
