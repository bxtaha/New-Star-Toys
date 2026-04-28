import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/server/db";

export async function GET() {
  try {
    const mongooseInstance = await connectToDatabase();
    const readyState = mongooseInstance?.connection?.readyState ?? 0;

    let pingOk = false;
    let pingMs = null;

    const db = mongooseInstance?.connection?.db;
    if (db) {
      const start = Date.now();
      await db.admin().ping();
      pingOk = true;
      pingMs = Date.now() - start;
    }

    const connected = readyState === 1 && pingOk;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: {
        connected,
        readyState,
        pingOk,
        pingMs,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        db: {
          connected: false,
        },
        error: error?.message || "Health check failed.",
      },
      { status: 503 },
    );
  }
}

