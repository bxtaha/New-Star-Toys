import { cookies, headers } from "next/headers";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "@/lib/i18n";

const COOKIE_NAME = "ycnst_lang";

function parseAcceptLanguage(value) {
  const raw = String(value || "");
  const parts = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.split(";")[0]?.trim())
    .filter(Boolean);

  for (const part of parts) {
    const base = part.toLowerCase();
    if (base.startsWith("zh")) {
      return "zh";
    }
    if (base.startsWith("en")) {
      return "en";
    }
  }

  return "";
}

export async function getRequestLanguage() {
  const cookieStore = await cookies();
  const cookieLang = normalizeLanguage(cookieStore.get(COOKIE_NAME)?.value);
  if (cookieLang) {
    return cookieLang;
  }

  const headerStore = await headers();
  const accept = headerStore.get("accept-language");
  const inferred = normalizeLanguage(parseAcceptLanguage(accept));
  return inferred || DEFAULT_LANGUAGE;
}
