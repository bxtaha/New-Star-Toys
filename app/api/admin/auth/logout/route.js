import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, deleteCurrentSession, getSessionCookieOptions } from "@/lib/server/auth";

export async function POST(request) {
  try {
    await deleteCurrentSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", getSessionCookieOptions(new Date(0), request));
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to sign out." }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import { SESSION_COOKIE_NAME, deleteCurrentSession } from "@/lib/server/auth";

// export async function POST() {
//   try {
//     await deleteCurrentSession();
//     const response = NextResponse.json({ success: true });
//     response.cookies.set(SESSION_COOKIE_NAME, "", {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: process.env.NODE_ENV === "production",
//       path: "/",
//       expires: new Date(0),
//     });
//     return response;
//   } catch (error) {
//     return NextResponse.json({ error: error.message || "Unable to sign out." }, { status: 500 });
//   }
// }
