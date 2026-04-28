import { normalizeLanguage } from "@/lib/i18n";

function trimValue(value) {
  return String(value || "").trim();
}

function cleanStringArray(values) {
  return (Array.isArray(values) ? values : []).map((value) => trimValue(value)).filter(Boolean);
}

export function normalizeLocalizedString(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      en: trimValue(value.en),
      zh: trimValue(value.zh),
    };
  }
  return {
    en: trimValue(value),
    zh: "",
  };
}

export function pickLocalizedString(value, lang) {
  const resolved = normalizeLanguage(lang);
  const localized = normalizeLocalizedString(value);
  if (resolved === "zh") {
    return localized.zh || localized.en || "";
  }
  return localized.en || localized.zh || "";
}

export function normalizeLocalizedStringArray(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      en: cleanStringArray(value.en),
      zh: cleanStringArray(value.zh),
    };
  }
  return {
    en: cleanStringArray(value),
    zh: [],
  };
}

export function pickLocalizedStringArray(value, lang) {
  const resolved = normalizeLanguage(lang);
  const localized = normalizeLocalizedStringArray(value);
  const picked = resolved === "zh" ? localized.zh : localized.en;
  return picked.length > 0 ? picked : resolved === "zh" ? localized.en : localized.zh;
}

