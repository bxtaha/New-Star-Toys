"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LANGUAGE, normalizeLanguage, tFor } from "@/lib/i18n";

const STORAGE_KEY = "ycnst_lang";
const COOKIE_SYNC_ENDPOINT = "/api/lang";

const I18nContext = createContext(null);

export function I18nProvider({ initialLanguage = DEFAULT_LANGUAGE, children }) {
  const router = useRouter();
  const [language, setLanguageState] = useState(normalizeLanguage(initialLanguage));

  const syncCookie = useCallback(async (nextLanguage) => {
    try {
      await fetch(COOKIE_SYNC_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: nextLanguage }),
      });
    } catch {
    }
  }, []);

  const setLanguage = useCallback(
    (next) => {
      const nextLanguage = normalizeLanguage(next);
      setLanguageState(nextLanguage);
      try {
        window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      } catch {
      }
      syncCookie(nextLanguage).finally(() => {
        router.refresh();
      });
      if (typeof document !== "undefined") {
        document.documentElement.lang = nextLanguage;
      }
    },
    [router, syncCookie],
  );

  useEffect(() => {
    let stored = "";
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) || "";
    } catch {
    }

    const normalized = normalizeLanguage(stored);
    if (stored && normalized !== language) {
      setLanguage(normalized);
      return;
    }

    if (!stored) {
      try {
        window.localStorage.setItem(STORAGE_KEY, language);
      } catch {
      }
      syncCookie(language);
    }
  }, [language, setLanguage, syncCookie]);

  const t = useMemo(() => tFor(language), [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { language: DEFAULT_LANGUAGE, setLanguage: () => undefined, t: tFor(DEFAULT_LANGUAGE) };
  }
  return ctx;
}
