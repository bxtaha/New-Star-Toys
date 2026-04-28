import nodemailer from "nodemailer";

function isTruthy(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

export function getMailerConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || "");
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || "";
  const secure = isTruthy(process.env.SMTP_SECURE) || port === 465;

  return { host, port, user, pass, from, secure };
}

export function canSendMail() {
  const cfg = getMailerConfig();
  return Boolean(cfg.host && cfg.port && cfg.user && cfg.pass && cfg.from);
}

export async function sendMail({ to, subject, text }) {
  const cfg = getMailerConfig();

  if (!cfg.host || !cfg.port || !cfg.user || !cfg.pass || !cfg.from) {
    throw new Error("Email is not configured on the server.");
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  const html = String(text || "")
    .split("\n")
    .map((line) => line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
    .join("<br/>");

  const result = await transporter.sendMail({
    from: cfg.from,
    to,
    subject,
    text,
    html,
  });

  return { messageId: result?.messageId || "" };
}

