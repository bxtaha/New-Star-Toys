import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/server/db";
import { Admin } from "@/models/Admin";
import { AdminSession } from "@/models/AdminSession";

export const SESSION_COOKIE_NAME = "ycnst_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_ADMIN_EMAIL = String(process.env.ADMIN_SEED_EMAIL || "dev@taha.com")
  .toLowerCase()
  .trim();
const DEFAULT_ADMIN_PASSWORD = String(process.env.ADMIN_SEED_PASSWORD || "password");
const DEFAULT_ADMIN_NAME = String(process.env.ADMIN_SEED_NAME || "Developer Admin").trim();

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function serializeAdmin(admin) {
  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    createdAt: admin.createdAt ? admin.createdAt.toISOString() : null,
    updatedAt: admin.updatedAt ? admin.updatedAt.toISOString() : null,
  };
}

export function getSessionCookieOptions(expiresAt) {
  const allowInsecureCookies = ["1", "true", "yes"].includes(
    String(process.env.ADMIN_ALLOW_INSECURE_COOKIES || "").toLowerCase().trim(),
  );

  let isHttpsRequest = null;
  const request = arguments.length > 1 ? arguments[1] : undefined;
  if (request) {
    const forwardedProto = request.headers?.get?.("x-forwarded-proto");
    if (forwardedProto) {
      isHttpsRequest = forwardedProto.split(",")[0].trim() === "https";
    } else {
      try {
        isHttpsRequest = new URL(request.url).protocol === "https:";
      } catch {
        isHttpsRequest = null;
      }
    }
  }

  const secure =
    process.env.NODE_ENV === "production" && !allowInsecureCookies && (isHttpsRequest ?? true);

  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: expiresAt,
  };
}

export async function ensureDefaultAdmin() {
  await connectToDatabase();

  const existingAdmin = await Admin.findOne({ email: DEFAULT_ADMIN_EMAIL });
  if (existingAdmin) {
    return serializeAdmin(existingAdmin);
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  const admin = await Admin.create({
    name: DEFAULT_ADMIN_NAME,
    email: DEFAULT_ADMIN_EMAIL,
    passwordHash,
  });

  return serializeAdmin(admin);
}

export async function createAdminSession(adminId) {
  await connectToDatabase();

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await AdminSession.create({
    adminId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function getCurrentAdmin() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashToken(sessionToken);
  const session = await AdminSession.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  const admin = await Admin.findById(session.adminId);
  if (!admin) {
    await AdminSession.deleteOne({ _id: session._id });
    return null;
  }

  return serializeAdmin(admin);
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin");
  }

  return admin;
}

export async function deleteCurrentSession() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return;
  }

  await AdminSession.deleteOne({ tokenHash: hashToken(sessionToken) });
}

export async function authenticateAdmin(email, password) {
  await ensureDefaultAdmin();

  const admin = await Admin.findOne({
    email: String(email || "").toLowerCase().trim(),
  });

  if (!admin) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(String(password || ""), admin.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  return serializeAdmin(admin);
}

export async function listAdmins() {
  await ensureDefaultAdmin();
  const admins = await Admin.find().sort({ createdAt: 1 });
  return admins.map((admin) => serializeAdmin(admin));
}

export async function createAdminAccount({ name, email, password }) {
  await ensureDefaultAdmin();

  const normalizedEmail = String(email || "").toLowerCase().trim();
  const existing = await Admin.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("An admin with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(String(password || ""), 10);
  const admin = await Admin.create({
    name: String(name || "").trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return serializeAdmin(admin);
}

export async function updateAdminAccount(id, { name, email, password }) {
  await ensureDefaultAdmin();

  const admin = await Admin.findById(id);
  if (!admin) {
    throw new Error("Admin not found.");
  }

  const normalizedEmail = String(email || "").toLowerCase().trim();
  const emailConflict = await Admin.findOne({
    email: normalizedEmail,
    _id: { $ne: id },
  });

  if (emailConflict) {
    throw new Error("Another admin already uses this email.");
  }

  admin.name = String(name || "").trim();
  admin.email = normalizedEmail;

  if (password) {
    admin.passwordHash = await bcrypt.hash(String(password), 10);
  }

  await admin.save();

  return serializeAdmin(admin);
}

export async function deleteAdminAccount(id, currentAdminId) {
  await ensureDefaultAdmin();

  const totalAdmins = await Admin.countDocuments();
  if (totalAdmins <= 1) {
    throw new Error("At least one admin account must remain.");
  }

  if (String(id) === String(currentAdminId)) {
    throw new Error("You cannot delete the account you are currently using.");
  }

  await AdminSession.deleteMany({ adminId: id });
  await Admin.findByIdAndDelete(id);
}
