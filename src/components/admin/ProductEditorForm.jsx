"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Loader2, Plus, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { normalizeLocalizedString, normalizeLocalizedStringArray } from "@/lib/i18n/localized";
import { useI18n } from "@/components/I18nProvider";

function mergeSpecs(enSpecs, zhSpecs) {
  const length = Math.max(enSpecs.length, zhSpecs.length);
  const merged = Array.from({ length }).map((_, index) => ({
    label: { en: enSpecs[index]?.label || "", zh: zhSpecs[index]?.label || "" },
    value: { en: enSpecs[index]?.value || "", zh: zhSpecs[index]?.value || "" },
  }));
  return merged.filter((item) => item.label.en && item.value.en);
}

const createInitialForm = (product) => {
  const title = normalizeLocalizedString(product?.title);
  const featuredLabel = normalizeLocalizedString(product?.featuredLabel);
  const description = normalizeLocalizedString(product?.description);
  const details = normalizeLocalizedString(product?.details);
  const features = normalizeLocalizedStringArray(product?.features);
  const specs = (product?.specs || []).map((item) => ({
    label: normalizeLocalizedString(item?.label),
    value: normalizeLocalizedString(item?.value),
  }));
  const variants = (product?.variants || []).map((variant) => ({
    colorName: String(variant?.colorName || ""),
    colorHex: String(variant?.colorHex || ""),
    slug: String(variant?.slug || ""),
  }));

  return {
  titleEn: title.en || "",
  titleZh: title.zh || "",
  slug: product?.slug || "",
  categories: product?.categories || (product?.category ? [product.category] : []),
  featuredLabelEn: featuredLabel.en || "",
  featuredLabelZh: featuredLabel.zh || "",
  showInCollection: Boolean(product?.showInCollection ?? true),
  isFeatured: Boolean(product?.isFeatured ?? false),
  coverImage: product?.coverImage || "",
  media: (product?.media || []).map((item) => ({
    ...item,
    slug: String(item?.slug || ""),
    variantSlug: String(item?.variantSlug || ""),
  })),
  variants,
  descriptionEn: description.en || "",
  descriptionZh: description.zh || "",
  moq: product?.moq || "",
  detailsEn: details.en || "",
  detailsZh: details.zh || "",
  featuresTextEn: (features.en || []).join("\n"),
  featuresTextZh: (features.zh || []).join("\n"),
  specsTextEn: specs.map((item) => (item.label.en && item.value.en ? `${item.label.en}: ${item.value.en}` : "")).filter(Boolean).join("\n"),
  specsTextZh: specs.map((item) => (item.label.zh && item.value.zh ? `${item.label.zh}: ${item.value.zh}` : "")).filter(Boolean).join("\n"),
  };
};

function parseLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecs(value) {
  return String(value || "")
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: label?.trim(),
        value: rest.join(":").trim(),
      };
    })
    .filter((item) => item.label && item.value);
}

function slugifyClient(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function slugFromUpload(file) {
  return slugifyClient(file?.slug || file?.name || "");
}

const ProductEditorForm = ({ mode, product, categories }) => {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState(createInitialForm(product));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const toggleCategory = (categoryName) => {
    setForm((previous) => ({
      ...previous,
      categories: previous.categories.includes(categoryName)
        ? previous.categories.filter((item) => item !== categoryName)
        : [...previous.categories, categoryName],
    }));
  };

  const uploadFiles = async ({ files }) => {
    const formData = new FormData();
    formData.append("type", "products");
    formData.append("entitySlug", form.slug || form.titleEn || "product");

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t("admin.productEditor.error.upload"));
    }

    return data.files || [];
  };

  const handleProductCoverUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setIsUploading(true);

    try {
      const uploaded = await uploadFiles({ files });
      const firstFile = uploaded[0];

      if (!firstFile) {
        throw new Error(t("admin.productEditor.error.noFile"));
      }

      const normalizedFile = {
        ...firstFile,
        slug: slugFromUpload(firstFile),
        variantSlug: "",
      };

      setForm((previous) => ({
        ...previous,
        coverImage: firstFile.url,
        media: previous.media.some((item) => item.url === firstFile.url)
          ? previous.media
          : [normalizedFile, ...previous.media],
      }));
      toast.success(t("admin.productEditor.toast.coverUploaded"));
    } catch (error) {
      toast.error(error.message || t("admin.productEditor.error.upload"));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleProductMediaUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setIsUploading(true);

    try {
      const uploaded = await uploadFiles({ files });

      setForm((previous) => {
        const nextMedia = [...previous.media];
        uploaded.forEach((file) => {
          if (!nextMedia.some((item) => item.url === file.url)) {
            nextMedia.push({
              ...file,
              slug: slugFromUpload(file),
              variantSlug: "",
            });
          }
        });

        return {
          ...previous,
          media: nextMedia,
          coverImage: previous.coverImage || uploaded[0]?.url || "",
        };
      });
      toast.success(t("admin.productEditor.toast.mediaUploaded"));
    } catch (error) {
      toast.error(error.message || t("admin.productEditor.error.upload"));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: { en: form.titleEn, zh: form.titleZh },
        slug: form.slug,
        categories: form.categories,
        featuredLabel: { en: form.featuredLabelEn, zh: form.featuredLabelZh },
        showInCollection: form.showInCollection,
        isFeatured: form.isFeatured,
        coverImage: form.coverImage,
        media: form.media.map((item) => ({
          kind: item.kind,
          url: item.url,
          slug: item.slug,
          variantSlug: item.variantSlug,
        })),
        variants: (form.variants || []).map((variant) => ({
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          slug: variant.slug,
        })),
        description: { en: form.descriptionEn, zh: form.descriptionZh },
        moq: form.moq,
        details: { en: form.detailsEn, zh: form.detailsZh },
        features: { en: parseLines(form.featuresTextEn), zh: parseLines(form.featuresTextZh) },
        specs: mergeSpecs(parseSpecs(form.specsTextEn), parseSpecs(form.specsTextZh)),
      };

      const response = await fetch(mode === "edit" ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.productEditor.error.save"));
      }

      toast.success(mode === "edit" ? t("admin.productEditor.toast.updated") : t("admin.productEditor.toast.created"));
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error.message || t("admin.productEditor.error.save"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.productEditor.titleEn")}</label>
          <Input
            value={form.titleEn}
            onChange={(event) => setForm((previous) => ({ ...previous, titleEn: event.target.value }))}
            placeholder="Pink Fantasy Plush"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.productEditor.titleZh")}</label>
          <Input
            value={form.titleZh}
            onChange={(event) => setForm((previous) => ({ ...previous, titleZh: event.target.value }))}
            placeholder="粉色梦幻毛绒玩具"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.productEditor.slug")}</label>
          <Input
            value={form.slug}
            onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
            placeholder="pink-fantasy-plush"
            required
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{t("admin.productEditor.variantsTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("admin.productEditor.variantsSubtitle")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setForm((previous) => ({
                ...previous,
                variants: [...(previous.variants || []), { colorName: "", colorHex: "#000000", slug: "" }],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            {t("admin.productEditor.variantsAdd")}
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          {(form.variants || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">{t("admin.productEditor.variantsEmpty")}</div>
          ) : (
            (form.variants || []).map((variant, index) => (
              <div key={`${variant.slug || "variant"}-${index}`} className="rounded-2xl border border-border p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_160px_1fr_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("admin.productEditor.variantColorName")}</label>
                    <Input
                      value={variant.colorName}
                      onChange={(event) =>
                        setForm((previous) => {
                          const next = [...(previous.variants || [])];
                          next[index] = { ...next[index], colorName: event.target.value };
                          if (!next[index].slug) {
                            next[index].slug = slugifyClient(event.target.value);
                          }
                          return { ...previous, variants: next };
                        })
                      }
                      placeholder="Pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("admin.productEditor.variantColorHex")}</label>
                    <Input
                      type="color"
                      value={variant.colorHex || "#000000"}
                      onChange={(event) =>
                        setForm((previous) => {
                          const next = [...(previous.variants || [])];
                          next[index] = { ...next[index], colorHex: event.target.value };
                          return { ...previous, variants: next };
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("admin.productEditor.variantSlug")}</label>
                    <Input
                      value={variant.slug}
                      onChange={(event) =>
                        setForm((previous) => {
                          const next = [...(previous.variants || [])];
                          next[index] = { ...next[index], slug: event.target.value };
                          return { ...previous, variants: next };
                        })
                      }
                      placeholder="pink-fantasy-plush-pink"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        setForm((previous) => {
                          const removeSlug = String(previous.variants?.[index]?.slug || "");
                          const nextVariants = (previous.variants || []).filter((_, idx) => idx !== index);
                          const nextMedia = (previous.media || []).map((item) =>
                            item.variantSlug && item.variantSlug === removeSlug ? { ...item, variantSlug: "" } : item,
                          );
                          return { ...previous, variants: nextVariants, media: nextMedia };
                        })
                      }
                      aria-label={t("admin.productEditor.variantRemove")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.productEditor.categories")}</label>
          <div className="rounded-2xl border border-border p-4">
            {categories.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-foreground">
                    <input type="checkbox" checked={form.categories.includes(category.name.en)} onChange={() => toggleCategory(category.name.en)} />
                    {category.name.zh ? `${category.name.en} / ${category.name.zh}` : category.name.en}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("admin.productEditor.categoriesEmpty")}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.productEditor.moq")}</label>
          <Input
            value={form.moq}
            onChange={(event) => setForm((previous) => ({ ...previous, moq: event.target.value }))}
            placeholder="2,000 pcs"
            required
          />
        </div>
      </div>

      {form.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {form.categories.map((category) => (
            <span key={category} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {category}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.showInCollection}
            onChange={(event) => setForm((previous) => ({ ...previous, showInCollection: event.target.checked }))}
          />
          {t("admin.productEditor.showInCollection")}
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => setForm((previous) => ({ ...previous, isFeatured: event.target.checked }))}
          />
          {t("admin.productEditor.featuredProject")}
        </label>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.featuredLabelEn")}</label>
        <Input
          value={form.featuredLabelEn}
          onChange={(event) => setForm((previous) => ({ ...previous, featuredLabelEn: event.target.value }))}
          placeholder="Custom OEM"
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.featuredLabelZh")}</label>
        <Input
          value={form.featuredLabelZh}
          onChange={(event) => setForm((previous) => ({ ...previous, featuredLabelZh: event.target.value }))}
          placeholder="定制 OEM"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.shortDescEn")}</label>
        <Textarea
          value={form.descriptionEn}
          onChange={(event) => setForm((previous) => ({ ...previous, descriptionEn: event.target.value }))}
          rows={3}
          placeholder="Short summary for cards and lists."
          required
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.shortDescZh")}</label>
        <Textarea
          value={form.descriptionZh}
          onChange={(event) => setForm((previous) => ({ ...previous, descriptionZh: event.target.value }))}
          rows={3}
          placeholder="用于列表和卡片的简短描述。"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.detailsEn")}</label>
        <Textarea
          value={form.detailsEn}
          onChange={(event) => setForm((previous) => ({ ...previous, detailsEn: event.target.value }))}
          rows={5}
          placeholder="Detailed description shown on the product page."
          required
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.detailsZh")}</label>
        <Textarea
          value={form.detailsZh}
          onChange={(event) => setForm((previous) => ({ ...previous, detailsZh: event.target.value }))}
          rows={5}
          placeholder="在产品详情页展示的详细描述。"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.featuresEn")}</label>
        <Textarea
          value={form.featuresTextEn}
          onChange={(event) => setForm((previous) => ({ ...previous, featuresTextEn: event.target.value }))}
          rows={6}
          placeholder="One feature per line"
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.featuresZh")}</label>
        <Textarea
          value={form.featuresTextZh}
          onChange={(event) => setForm((previous) => ({ ...previous, featuresTextZh: event.target.value }))}
          rows={6}
          placeholder="每行一个特点"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.specsEn")}</label>
        <Textarea
          value={form.specsTextEn}
          onChange={(event) => setForm((previous) => ({ ...previous, specsTextEn: event.target.value }))}
          rows={5}
          placeholder={"Size: 28 cm / 11 inches\nMaterial: Velboa plush"}
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.productEditor.specsZh")}</label>
        <Textarea
          value={form.specsTextZh}
          onChange={(event) => setForm((previous) => ({ ...previous, specsTextZh: event.target.value }))}
          rows={5}
          placeholder={"尺寸: 28 厘米\n材质: 超柔短毛绒"}
        />
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{t("admin.productEditor.coverTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("admin.productEditor.coverSubtitle")}</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <Upload className="h-4 w-4" />
            {isUploading ? t("admin.productEditor.uploading") : t("admin.productEditor.uploadCover")}
            <input type="file" accept="image/*" className="hidden" onChange={handleProductCoverUpload} />
          </label>
        </div>

        {form.coverImage && <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">{form.coverImage}</div>}
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{t("admin.productEditor.mediaTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("admin.productEditor.mediaSubtitle")}</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <Upload className="h-4 w-4" />
            {isUploading ? t("admin.productEditor.uploading") : t("admin.productEditor.uploadMedia")}
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleProductMediaUpload} />
          </label>
        </div>

        <div className="grid gap-3">
          {form.media.map((item) => (
            <div key={item.url} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                {item.kind === "image" ? (
                  <img src={item.url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {item.kind === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.kind === "video" ? t("admin.productEditor.mediaKindVideo") : t("admin.productEditor.mediaKindImage")}
                  </p>
                  <p className="max-w-[260px] truncate text-xs text-muted-foreground">{item.url}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                <div className="min-w-[180px]">
                  <select
                    value={item.variantSlug || ""}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setForm((previous) => ({
                        ...previous,
                        media: previous.media.map((mediaItem) =>
                          mediaItem.url === item.url ? { ...mediaItem, variantSlug: nextValue } : mediaItem,
                        ),
                      }));
                    }}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                  >
                    <option value="">{t("admin.productEditor.mediaVariantUnassigned")}</option>
                    {(form.variants || []).map((variant) => (
                      <option key={variant.slug} value={variant.slug}>
                        {variant.colorName} ({variant.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[180px]">
                  <Input
                    value={item.slug || ""}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        media: previous.media.map((mediaItem) =>
                          mediaItem.url === item.url ? { ...mediaItem, slug: event.target.value } : mediaItem,
                        ),
                      }))
                    }
                    placeholder={t("admin.productEditor.mediaSlugPlaceholder")}
                  />
                </div>

              <div className="flex gap-2">
                {item.kind === "image" && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm((previous) => ({ ...previous, coverImage: item.url }))}>
                    {t("admin.productEditor.setCover")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setForm((previous) => {
                      const nextMedia = previous.media.filter((mediaItem) => mediaItem.url !== item.url);
                      return {
                        ...previous,
                        media: nextMedia,
                        coverImage: previous.coverImage === item.url ? nextMedia.find((mediaItem) => mediaItem.kind === "image")?.url || "" : previous.coverImage,
                      };
                    })
                  }
                >
                  {t("admin.productEditor.remove")}
                </Button>
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          {t("admin.productEditor.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "edit" ? t("admin.productEditor.submitUpdate") : t("admin.productEditor.submitCreate")}
        </Button>
      </div>
    </form>
  );
};

export default ProductEditorForm;
