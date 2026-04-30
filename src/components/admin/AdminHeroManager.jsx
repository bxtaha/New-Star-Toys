"use client";

import { useMemo, useState } from "react";
import { Check, ImageUp, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { normalizeLocalizedString } from "@/lib/i18n/localized";
import { useI18n } from "@/components/I18nProvider";

const heroPageOptions = [
  { key: "home", labelKey: "nav.home" },
  { key: "services", labelKey: "nav.services" },
  { key: "collection", labelKey: "nav.collection" },
  { key: "blogs", labelKey: "nav.blogs" },
  { key: "about", labelKey: "nav.about" },
  { key: "contact", labelKey: "nav.contact" },
];

function normalizeHeroPage(page) {
  const title = normalizeLocalizedString(page?.title);
  const subtitle = normalizeLocalizedString(page?.subtitle);
  return {
    key: page?.key || "home",
    title,
    subtitle,
    imageUrl: page?.imageUrl || "",
    images: Array.from(new Set((page?.images || []).filter(Boolean))),
  };
}

function upsertHeroPage(settings, nextPage) {
  const pages = Array.isArray(settings?.heroPages) ? settings.heroPages : [];
  const updated = pages.some((page) => page.key === nextPage.key)
    ? pages.map((page) => (page.key === nextPage.key ? nextPage : page))
    : [...pages, nextPage];

  return { ...settings, heroPages: updated };
}

const AdminHeroManager = ({ initialSiteSettings }) => {
  const { t } = useI18n();
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [selectedPageKey, setSelectedPageKey] = useState("home");
  const [heroFileUploading, setHeroFileUploading] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState("");

  const currentHero = useMemo(() => {
    const page = (siteSettings?.heroPages || []).find((item) => item.key === selectedPageKey);
    return normalizeHeroPage(page || { key: selectedPageKey });
  }, [siteSettings, selectedPageKey]);

  const heroImages = useMemo(() => {
    return Array.from(new Set([currentHero.imageUrl, ...(currentHero.images || [])].filter(Boolean)));
  }, [currentHero.imageUrl, currentHero.images]);

  const uploadHeroFile = async (file) => {
    const formData = new FormData();
    formData.append("type", "site");
    formData.append("entitySlug", `${selectedPageKey}-hero`);
    formData.append("files", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t("admin.siteSettings.hero.error.upload"));
    }

    const uploadedUrl = data.files?.[0]?.url;
    if (!uploadedUrl) {
      throw new Error(t("admin.siteSettings.hero.error.noUrl"));
    }

    return uploadedUrl;
  };

  const handleHeroFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setHeroFileUploading(true);
    try {
      const url = await uploadHeroFile(file);
      const nextPage = normalizeHeroPage({
        ...currentHero,
        imageUrl: url,
        images: Array.from(new Set([url, ...(currentHero.images || [])])),
      });
      setSiteSettings((previous) => upsertHeroPage(previous, nextPage));
      toast.success(t("admin.siteSettings.hero.toast.uploaded"));
    } catch (error) {
      toast.error(error.message || t("admin.siteSettings.hero.error.upload"));
    } finally {
      setHeroFileUploading(false);
      event.target.value = "";
    }
  };

  const handleHeroSave = async () => {
    setHeroSaving(true);
    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageKey: selectedPageKey,
          heroImageUrl: currentHero.imageUrl,
          heroTitle: currentHero.title,
          heroSubtitle: currentHero.subtitle,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.siteSettings.hero.error.save"));
      }

      setSiteSettings(data.settings);
      toast.success(t("admin.siteSettings.hero.toast.saved"));
    } catch (error) {
      toast.error(error.message || t("admin.siteSettings.hero.error.save"));
    } finally {
      setHeroSaving(false);
    }
  };

  const handleSelectHero = (url) => {
    const nextPage = normalizeHeroPage({ ...currentHero, imageUrl: url });
    setSiteSettings((previous) => upsertHeroPage(previous, nextPage));
  };

  const handleUseDefault = () => {
    const nextPage = normalizeHeroPage({ ...currentHero, imageUrl: "" });
    setSiteSettings((previous) => upsertHeroPage(previous, nextPage));
  };

  const handleDeleteHeroImage = async (url) => {
    const shouldDelete = window.confirm(t("admin.siteSettings.hero.confirmDelete"));
    if (!shouldDelete) {
      return;
    }

    setDeletingUrl(url);
    try {
      const response = await fetch(
        `/api/admin/site-settings?pageKey=${encodeURIComponent(selectedPageKey)}&heroImageUrl=${encodeURIComponent(url)}`,
        {
        method: "DELETE",
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.siteSettings.hero.error.delete"));
      }

      setSiteSettings(data.settings);
      toast.success(t("admin.siteSettings.hero.toast.deleted"));
    } catch (error) {
      toast.error(error.message || t("admin.siteSettings.hero.error.delete"));
    } finally {
      setDeletingUrl("");
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground">{t("admin.siteSettings.hero.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.siteSettings.hero.subtitle")}
          </p>
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
            {heroPageOptions.map((option) => {
              const isActive = option.key === selectedPageKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSelectedPageKey(option.key)}
                  disabled={heroFileUploading || heroSaving}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {t(option.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
            <span className={heroFileUploading ? "inline-flex items-center" : "hidden"}>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("admin.siteSettings.hero.uploading")}
            </span>
            <span className={heroFileUploading ? "hidden" : "inline-flex items-center"}>
              <ImageUp className="mr-2 h-4 w-4" />
              {t("admin.siteSettings.hero.uploadImage")}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHeroFileChange}
              disabled={heroFileUploading || heroSaving}
            />
          </label>
          <Button variant="outline" onClick={handleUseDefault} disabled={heroFileUploading || heroSaving}>
            {t("admin.siteSettings.hero.useDefault")}
          </Button>
          <Button onClick={handleHeroSave} disabled={heroFileUploading || heroSaving}>
            {heroSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.siteSettings.hero.save")}
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-muted">
        {currentHero.imageUrl ? (
          <img
            src={currentHero.imageUrl}
            alt="Hero"
            className="h-56 w-full object-cover sm:h-72"
            loading="lazy"
          />
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground sm:h-72">
            {t("admin.siteSettings.hero.usingDefault")}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.siteSettings.hero.titleEn")}</label>
          <Input
            value={currentHero.title.en}
            onChange={(event) => {
              const nextPage = normalizeHeroPage({
                ...currentHero,
                title: { ...currentHero.title, en: event.target.value },
              });
              setSiteSettings((previous) => upsertHeroPage(previous, nextPage));
            }}
            placeholder="Your Trusted OEM/ODM Plush Toy Partner"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.siteSettings.hero.subtitleEn")}</label>
          <Input
            value={currentHero.subtitle.en}
            onChange={(event) => {
              const nextPage = normalizeHeroPage({
                ...currentHero,
                subtitle: { ...currentHero.subtitle, en: event.target.value },
              });
              setSiteSettings((previous) => upsertHeroPage(previous, nextPage));
            }}
            placeholder="Premium custom plush toys manufactured with care..."
          />
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.siteSettings.hero.titleZh")}</label>
          <Input
            value={currentHero.title.zh}
            onChange={(event) => {
              const nextPage = normalizeHeroPage({
                ...currentHero,
                title: { ...currentHero.title, zh: event.target.value },
              });
              setSiteSettings((previous) => upsertHeroPage(previous, nextPage));
            }}
            placeholder="您值得信赖的 OEM/ODM 毛绒玩具合作伙伴"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.siteSettings.hero.subtitleZh")}</label>
          <Input
            value={currentHero.subtitle.zh}
            onChange={(event) => {
              const nextPage = normalizeHeroPage({
                ...currentHero,
                subtitle: { ...currentHero.subtitle, zh: event.target.value },
              });
              setSiteSettings((previous) => upsertHeroPage(previous, nextPage));
            }}
            placeholder="用心制造高品质定制毛绒玩具..."
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-heading font-semibold text-foreground">{t("admin.siteSettings.hero.uploadsTitle")}</h4>
          <p className="text-sm text-muted-foreground">{t("admin.siteSettings.hero.total", { count: heroImages.length })}</p>
        </div>

        {heroImages.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background p-6 text-sm text-muted-foreground">
            {t("admin.siteSettings.hero.noneUploaded")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {heroImages.map((url) => {
              const isSelected = currentHero.imageUrl === url;
              return (
                <div key={url} className="overflow-hidden rounded-2xl border border-border bg-background">
                  <button
                    type="button"
                    className="relative block w-full"
                    onClick={() => handleSelectHero(url)}
                    disabled={heroFileUploading || heroSaving}
                  >
                    <img src={url} alt="Hero upload" className="h-36 w-full object-cover" loading="lazy" />
                    {isSelected ? (
                      <div className="absolute inset-0 bg-primary/20" />
                    ) : null}
                  </button>

                  <div className="flex items-center justify-between gap-2 p-3">
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? "secondary" : "outline"}
                      className="flex-1 justify-center gap-2"
                      onClick={() => handleSelectHero(url)}
                      disabled={heroFileUploading || heroSaving}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : null}
                      {isSelected ? t("admin.siteSettings.hero.selected") : t("admin.siteSettings.hero.select")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteHeroImage(url)}
                      disabled={heroFileUploading || heroSaving || deletingUrl === url}
                    >
                      {deletingUrl === url ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeroManager;
