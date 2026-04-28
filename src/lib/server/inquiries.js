import { connectToDatabase } from "@/lib/server/db";
import { Inquiry } from "@/models/Inquiry";
import { sendMail } from "@/lib/server/mailer";
import { normalizeLanguage } from "@/lib/i18n";

function trimValue(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return trimValue(value).toLowerCase();
}

function serializeInquiry(inquiry) {
  return {
    id: inquiry._id.toString(),
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company || "",
    message: inquiry.message,
    sourcePath: inquiry.sourcePath || "",
    language: inquiry.language || "en",
    status: inquiry.status || "new",
    replies: (inquiry.replies || []).map((reply) => ({
      id: reply._id.toString(),
      adminId: reply.adminId?.toString?.() || "",
      adminName: reply.adminName,
      adminEmail: reply.adminEmail,
      subject: reply.subject,
      message: reply.message,
      to: reply.to,
      from: reply.from,
      messageId: reply.messageId || "",
      sentAt: reply.sentAt ? new Date(reply.sentAt).toISOString() : null,
    })),
    createdAt: inquiry.createdAt ? new Date(inquiry.createdAt).toISOString() : null,
    updatedAt: inquiry.updatedAt ? new Date(inquiry.updatedAt).toISOString() : null,
    lastRepliedAt: inquiry.lastRepliedAt ? new Date(inquiry.lastRepliedAt).toISOString() : null,
  };
}

export async function createInquiry(payload, requestMeta = {}) {
  await connectToDatabase();

  const name = trimValue(payload?.name);
  const email = normalizeEmail(payload?.email);
  const company = trimValue(payload?.company);
  const message = trimValue(payload?.message);
  const sourcePath = trimValue(payload?.sourcePath || requestMeta?.sourcePath);
  const language = normalizeLanguage(payload?.language || requestMeta?.language);

  if (!name) {
    throw new Error("Name is required.");
  }
  if (!email || !email.includes("@")) {
    throw new Error("Email is required.");
  }
  if (!message) {
    throw new Error("Message is required.");
  }

  const inquiry = await Inquiry.create({
    name,
    email,
    company,
    message,
    sourcePath,
    language,
    status: "new",
  });

  return { inquiry: serializeInquiry(inquiry) };
}

export async function listInquiriesForAdmin({ page = 1, pageSize = 20, query = "", status = "" } = {}) {
  await connectToDatabase();

  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const q = trimValue(query);
  const statusFilter = trimValue(status);

  const filter = {};
  if (statusFilter) {
    filter.status = statusFilter;
  }

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const totalCount = await Inquiry.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const skip = (safePage - 1) * safePageSize;

  const inquiries = await Inquiry.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safePageSize)
    .lean();

  return {
    inquiries: inquiries.map((inquiry) => serializeInquiry(inquiry)),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalPages,
      totalCount,
    },
  };
}

export async function getInquiryForAdmin(id) {
  await connectToDatabase();
  const inquiry = await Inquiry.findById(id);
  if (!inquiry) {
    return null;
  }
  return serializeInquiry(inquiry);
}

export async function addInquiryReply({ inquiryId, admin, subject, message }) {
  await connectToDatabase();

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new Error("Inquiry not found.");
  }

  const to = normalizeEmail(inquiry.email);
  const cleanSubject = trimValue(subject);
  const cleanMessage = trimValue(message);
  if (!cleanSubject) {
    throw new Error("Subject is required.");
  }
  if (!cleanMessage) {
    throw new Error("Message is required.");
  }

  const mailResult = await sendMail({
    to,
    subject: cleanSubject,
    text: cleanMessage,
  });

  const from = process.env.SMTP_FROM || "";

  inquiry.replies.push({
    adminId: admin.id,
    adminName: admin.name,
    adminEmail: admin.email,
    subject: cleanSubject,
    message: cleanMessage,
    to,
    from,
    messageId: mailResult?.messageId || "",
    sentAt: new Date(),
  });
  inquiry.status = "replied";
  inquiry.lastRepliedAt = new Date();
  await inquiry.save();

  return { inquiry: serializeInquiry(inquiry) };
}

export async function updateInquiryStatus({ inquiryId, status }) {
  await connectToDatabase();
  const cleanStatus = trimValue(status);
  if (!["new", "replied", "archived"].includes(cleanStatus)) {
    throw new Error("Invalid status.");
  }
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new Error("Inquiry not found.");
  }
  inquiry.status = cleanStatus;
  await inquiry.save();
  return { inquiry: serializeInquiry(inquiry) };
}

