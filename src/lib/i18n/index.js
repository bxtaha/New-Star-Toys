import { DEFAULT_LANGUAGE, messages, SUPPORTED_LANGUAGES } from "./messages";

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES };

export function normalizeLanguage(value) {
  const lang = String(value || "").toLowerCase().trim();
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
}

export function tFor(lang) {
  const resolved = normalizeLanguage(lang);
  return (key, vars) => {
    const template = messages[resolved]?.[key] ?? messages[DEFAULT_LANGUAGE]?.[key] ?? key;
    if (!vars || typeof template !== "string") {
      return template;
    }
    return template.replace(/\{(\w+)\}/g, (_, token) => {
      const value = vars[token];
      return value === undefined || value === null ? "" : String(value);
    });
  };
}
