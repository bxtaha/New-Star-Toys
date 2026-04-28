"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export function useHeroSettings(pageKey) {
  const { language } = useI18n();
  const [hero, setHero] = useState({ title: "", subtitle: "", imageUrl: "", loaded: false });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/site-settings/hero?pageKey=${encodeURIComponent(pageKey)}&lang=${encodeURIComponent(language)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load hero settings.");
        }

        if (!cancelled) {
          setHero({
            title: data.hero?.title || "",
            subtitle: data.hero?.subtitle || "",
            imageUrl: data.hero?.imageUrl || "",
            loaded: true,
          });
        }
      } catch {
        if (!cancelled) {
          setHero((previous) => ({ ...previous, loaded: true }));
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [language, pageKey]);

  return hero;
}
