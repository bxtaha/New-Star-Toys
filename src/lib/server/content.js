import { connectToDatabase } from "@/lib/server/db";
import { deleteManagedUpload, deleteManagedUploads, isManagedUploadUrl } from "@/lib/server/uploads";
import { defaultBlogs, defaultProducts } from "@/lib/server/default-content";
import { Product } from "@/models/Product";
import { Blog } from "@/models/Blog";
import { Category } from "@/models/Category";
import { SiteSettings } from "@/models/SiteSettings";
import { getRequestLanguage } from "@/lib/server/request-language";
import {
  normalizeLocalizedString,
  normalizeLocalizedStringArray,
  pickLocalizedString,
  pickLocalizedStringArray,
} from "@/lib/i18n/localized";

const globalForContent = globalThis;

if (!globalForContent.__contentSeedPromise) {
  globalForContent.__contentSeedPromise = null;
}

function toPlain(document) {
  return JSON.parse(JSON.stringify(document));
}

const SITE_SETTINGS_KEY = "default";

function trimValue(value) {
  return String(value || "").trim();
}

function cleanStringArray(values) {
  return (Array.isArray(values) ? values : [])
    .map((value) => trimValue(value))
    .filter(Boolean);
}

function uniqueStringArray(values) {
  return [...new Set(cleanStringArray(values))];
}

function cleanSpecs(values) {
  return (Array.isArray(values) ? values : [])
    .map((item) => ({
      label: trimValue(item?.label),
      value: trimValue(item?.value),
    }))
    .filter((item) => item.label && item.value);
}

function asBoolean(value) {
  return value === true || value === "true" || value === "on";
}

export function slugify(value) {
  return trimValue(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateReadTime(content) {
  const wordCount = cleanStringArray(content)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

function formatDisplayDate(value, lang) {
  const locale = lang === "zh" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getProductCategories(product) {
  const categories = uniqueStringArray(product?.categories?.length ? product.categories : [product?.category]);
  return categories;
}

function getCategoryKeyFromDocument(category) {
  const name = normalizeLocalizedString(category?.name);
  return name.en || "";
}

function serializeCategoryAdmin(category) {
  const name = normalizeLocalizedString(category.name);
  return {
    id: category._id.toString(),
    name,
    slug: category.slug,
    createdAt: category.createdAt ? category.createdAt.toISOString() : null,
    updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
  };
}

function buildCategoryDisplayMap(categoryDocuments, lang) {
  const map = new Map();
  for (const category of Array.isArray(categoryDocuments) ? categoryDocuments : []) {
    const key = getCategoryKeyFromDocument(category);
    if (!key) {
      continue;
    }
    const display = pickLocalizedString(category.name, lang) || key;
    map.set(key, display);
  }
  return map;
}

function normalizeSeedProduct(product) {
  const categories = getProductCategories(product);
  const title = normalizeLocalizedString(product?.title);
  const featuredLabel = normalizeLocalizedString(product?.featuredLabel);
  const description = normalizeLocalizedString(product?.description);
  const details = normalizeLocalizedString(product?.details);
  const features = normalizeLocalizedStringArray(product?.features);
  const specs = (Array.isArray(product?.specs) ? product.specs : [])
    .map((item) => ({
      label: normalizeLocalizedString(item?.label),
      value: normalizeLocalizedString(item?.value),
    }))
    .filter((item) => item.label.en && item.value.en);

  return {
    ...product,
    title,
    featuredLabel,
    description,
    details,
    features,
    specs,
    category: categories[0] || "",
    categories,
  };
}

function serializeProductPublic(product, lang, categoryDisplayMap, selectedVariantSlug = "") {
  const categoryKeys = getProductCategories(product);
  const categories = categoryKeys.map((value) => categoryDisplayMap?.get(value) || value);
  const primaryCategory = categories[0] || "";

  const title = pickLocalizedString(product.title, lang);
  const featuredLabel = pickLocalizedString(product.featuredLabel, lang) || primaryCategory;
  const description = pickLocalizedString(product.description, lang);
  const details = pickLocalizedString(product.details, lang);
  const features = pickLocalizedStringArray(product.features, lang);
  const specs = (product.specs || [])
    .map((item) => ({
      label: pickLocalizedString(item?.label, lang),
      value: pickLocalizedString(item?.value, lang),
    }))
    .filter((item) => item.label && item.value);

  const variants = (product.variants || [])
    .map((variant) => {
      const variantSlug = trimValue(variant?.slug);
      const media = (product.media || [])
        .filter((item) => trimValue(item?.variantSlug) === variantSlug)
        .map((item) => ({
          kind: item.kind,
          url: item.url,
          slug: trimValue(item?.slug) || "",
        }));
      const coverImage = media.find((item) => item.kind === "image")?.url || product.coverImage;
      return {
        colorName: trimValue(variant?.colorName),
        colorHex: trimValue(variant?.colorHex) || "",
        slug: variantSlug,
        coverImage,
        media,
      };
    })
    .filter((variant) => variant.colorName && variant.slug);

  return {
    id: product._id.toString(),
    slug: product.slug,
    selectedVariantSlug: trimValue(selectedVariantSlug) || product.slug,
    title,
    category: primaryCategory,
    categories,
    featuredLabel,
    showInCollection: Boolean(product.showInCollection),
    isFeatured: Boolean(product.isFeatured),
    image: product.coverImage,
    coverImage: product.coverImage,
    media: (product.media || []).map((item) => ({
      kind: item.kind,
      url: item.url,
      slug: trimValue(item?.slug) || "",
      variantSlug: trimValue(item?.variantSlug) || "",
    })),
    variants,
    description,
    moq: product.moq,
    details,
    features,
    specs,
  };
}

function serializeProductAdmin(product) {
  const categories = getProductCategories(product);

  return {
    id: product._id.toString(),
    title: normalizeLocalizedString(product.title),
    slug: product.slug,
    category: categories[0] || "",
    categories,
    featuredLabel: normalizeLocalizedString(product.featuredLabel),
    showInCollection: Boolean(product.showInCollection),
    isFeatured: Boolean(product.isFeatured),
    coverImage: product.coverImage,
    media: (product.media || []).map((item) => ({
      kind: item.kind,
      url: item.url,
      slug: trimValue(item?.slug) || "",
      variantSlug: trimValue(item?.variantSlug) || "",
    })),
    variants: (product.variants || []).map((variant) => ({
      colorName: trimValue(variant?.colorName),
      colorHex: trimValue(variant?.colorHex) || "",
      slug: trimValue(variant?.slug),
    })),
    description: normalizeLocalizedString(product.description),
    moq: product.moq,
    details: normalizeLocalizedString(product.details),
    features: normalizeLocalizedStringArray(product.features),
    specs: (product.specs || []).map((item) => ({
      label: normalizeLocalizedString(item?.label),
      value: normalizeLocalizedString(item?.value),
    })),
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
  };
}

function serializeBlogPublic(blog, lang, categoryDisplayMap) {
  const categoryKey = trimValue(blog.category);
  const category = categoryDisplayMap?.get(categoryKey) || categoryKey;
  const content = pickLocalizedStringArray(blog.content, lang);

  return {
    id: blog._id.toString(),
    slug: blog.slug,
    title: pickLocalizedString(blog.title, lang),
    excerpt: pickLocalizedString(blog.excerpt, lang),
    shortExcerpt: pickLocalizedString(blog.shortExcerpt, lang),
    date: formatDisplayDate(blog.publishedAt, lang),
    category,
    readTime: blog.readTime,
    image: blog.coverImage,
    coverImage: blog.coverImage,
    content,
    likesCount: blog.likesCount || 0,
    comments: (blog.comments || []).map((comment) => ({
      id: comment._id.toString(),
      name: comment.name,
      text: comment.text,
      date: formatDisplayDate(comment.createdAt, lang),
      createdAt: new Date(comment.createdAt).toISOString(),
      replies: (comment.replies || []).map((reply) => ({
        id: reply._id.toString(),
        authorName: reply.authorName,
        text: reply.text,
        date: formatDisplayDate(reply.createdAt, lang),
        createdAt: new Date(reply.createdAt).toISOString(),
      })),
    })),
  };
}

function serializeBlogAdmin(blog) {
  return {
    id: blog._id.toString(),
    slug: blog.slug,
    title: normalizeLocalizedString(blog.title),
    excerpt: normalizeLocalizedString(blog.excerpt),
    shortExcerpt: normalizeLocalizedString(blog.shortExcerpt),
    category: blog.category,
    readTime: blog.readTime,
    publishedAt: new Date(blog.publishedAt).toISOString().slice(0, 10),
    coverImage: blog.coverImage,
    content: normalizeLocalizedStringArray(blog.content),
    likesCount: blog.likesCount || 0,
    comments: [...(blog.comments || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((comment) => ({
      id: comment._id.toString(),
      name: comment.name,
      text: comment.text,
      createdAt: new Date(comment.createdAt).toISOString(),
      date: formatDisplayDate(comment.createdAt, "en"),
      replies: [...(comment.replies || [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((reply) => ({
        id: reply._id.toString(),
        authorName: reply.authorName,
        text: reply.text,
        createdAt: new Date(reply.createdAt).toISOString(),
        date: formatDisplayDate(reply.createdAt, "en"),
      })),
    })),
    createdAt: blog.createdAt ? blog.createdAt.toISOString() : null,
    updatedAt: blog.updatedAt ? blog.updatedAt.toISOString() : null,
  };
}

function collectProductManagedUrls(product) {
  return [...new Set([product.coverImage, ...(product.media || []).map((item) => item.url)].filter(Boolean))];
}

function collectBlogManagedUrls(blog) {
  return [...new Set([blog.coverImage].filter(Boolean))];
}

async function syncProductCategoryFields() {
  const products = await Product.find();
  const updates = products.map(async (product) => {
    const categories = getProductCategories(product);
    const primaryCategory = categories[0] || "";
    const currentCategories = uniqueStringArray(product.categories || []);
    const currentPrimary = trimValue(product.category);
    const hasChanged =
      currentPrimary !== primaryCategory ||
      currentCategories.length !== categories.length ||
      currentCategories.some((value, index) => value !== categories[index]);

    if (!hasChanged) {
      return;
    }

    product.category = primaryCategory;
    product.categories = categories;
    await product.save();
  });

  await Promise.all(updates);
}

async function syncCategoryDocuments() {
  const products = await Product.find();
  const categoryNames = uniqueStringArray([
    ...defaultProducts.flatMap((product) => getProductCategories(product)),
    ...products.flatMap((product) => getProductCategories(product)),
  ]);

  const existingCategories = await Category.find();
  const existingNames = new Set(existingCategories.map((category) => getCategoryKeyFromDocument(category)));
  const missingCategories = categoryNames.filter((name) => !existingNames.has(name));

  if (missingCategories.length > 0) {
    await Category.insertMany(
      missingCategories.map((name) => ({
        name: { en: name, zh: "" },
        slug: slugify(name),
      })),
    );
  }
}

async function assertCategoriesExist(categories) {
  const normalizedCategories = uniqueStringArray(categories);
  const existingCategories = await Category.find({
    $or: [
      { slug: { $in: normalizedCategories } },
      { "name.en": { $in: normalizedCategories } },
      { name: { $in: normalizedCategories } },
    ],
  });

  const existingKeys = new Set();
  existingCategories.forEach((category) => {
    existingKeys.add(getCategoryKeyFromDocument(category));
    existingKeys.add(trimValue(category.slug));
    existingKeys.add(trimValue(category.name));
  });

  const missingNames = normalizedCategories.filter((name) => !existingKeys.has(name));
  if (missingNames.length > 0) {
    throw new Error(`These categories do not exist: ${missingNames.join(", ")}`);
  }
}

export async function ensureContentSeeded() {
  await connectToDatabase();

  if (!globalForContent.__contentSeedPromise) {
    globalForContent.__contentSeedPromise = (async () => {
      const [productCount, blogCount] = await Promise.all([
        Product.countDocuments(),
        Blog.countDocuments(),
      ]);

      if (productCount === 0) {
        await Product.insertMany(defaultProducts.map((product) => normalizeSeedProduct(product)));
      }

      if (blogCount === 0) {
        await Blog.insertMany(defaultBlogs.map((blog) => normalizeSeedBlog(blog)));
      }

      await syncProductCategoryFields();
      await syncCategoryDocuments();
    })();
  }

  await globalForContent.__contentSeedPromise;
}

export function normalizeProductPayload(payload) {
  const title = normalizeLocalizedString(payload?.title);
  const slug = slugify(payload?.slug || title.en || payload?.title);
  const categories = uniqueStringArray(
    Array.isArray(payload?.categories) && payload.categories.length > 0 ? payload.categories : [payload?.category],
  );
  const featuredLabel = normalizeLocalizedString(payload?.featuredLabel);
  const variants = (Array.isArray(payload?.variants) ? payload.variants : [])
    .map((variant) => {
      const colorName = trimValue(variant?.colorName);
      const colorHex = trimValue(variant?.colorHex) || "";
      const variantSlug = slugify(variant?.slug || colorName);
      return { colorName, colorHex, slug: variantSlug };
    })
    .filter((variant) => variant.colorName || variant.slug);

  if (variants.some((variant) => !variant.colorName || !variant.slug)) {
    throw new Error("Each variant must include a color name and slug.");
  }

  const variantSlugSet = new Set(variants.map((variant) => variant.slug));

  const media = (Array.isArray(payload?.media) ? payload.media : [])
    .map((item) => ({
      kind: item?.kind === "video" ? "video" : "image",
      url: trimValue(item?.url),
      slug: slugify(item?.slug || ""),
      variantSlug: slugify(item?.variantSlug || ""),
    }))
    .filter((item) => item.url);

  const normalizedMedia = media.map((item) =>
    item.variantSlug && !variantSlugSet.has(item.variantSlug) ? { ...item, variantSlug: "" } : item,
  );
  const coverImage = trimValue(payload?.coverImage) || normalizedMedia[0]?.url || "";
  const features = normalizeLocalizedStringArray(payload?.features);
  const specs = (Array.isArray(payload?.specs) ? payload.specs : [])
    .map((item) => ({
      label: normalizeLocalizedString(item?.label),
      value: normalizeLocalizedString(item?.value),
    }))
    .filter((item) => item.label.en && item.value.en);
  const description = normalizeLocalizedString(payload?.description);
  const moq = trimValue(payload?.moq);
  const details = normalizeLocalizedString(payload?.details);

  if (!title.en || !slug || categories.length === 0 || !coverImage || !description.en || !moq || !details.en) {
    throw new Error("Please fill in all required product fields.");
  }

  const allSlugs = [slug, ...variants.map((variant) => variant.slug)].filter(Boolean);
  const uniqueSlugs = new Set(allSlugs);
  if (uniqueSlugs.size !== allSlugs.length) {
    throw new Error("Product slug and variant slugs must be unique.");
  }

  return {
    title,
    slug,
    category: categories[0],
    categories,
    featuredLabel,
    showInCollection: asBoolean(payload?.showInCollection),
    isFeatured: asBoolean(payload?.isFeatured),
    coverImage,
    media: normalizedMedia,
    variants,
    description,
    moq,
    details,
    features,
    specs,
  };
}

export function normalizeBlogPayload(payload) {
  const title = normalizeLocalizedString(payload?.title);
  const slug = slugify(payload?.slug || title.en || payload?.title);
  const excerpt = normalizeLocalizedString(payload?.excerpt);
  const shortExcerptRaw = normalizeLocalizedString(payload?.shortExcerpt);
  const shortExcerpt = {
    en: shortExcerptRaw.en || excerpt.en,
    zh: shortExcerptRaw.zh || excerpt.zh,
  };
  const category = trimValue(payload?.category);
  const publishedAt = trimValue(payload?.publishedAt) || new Date().toISOString().slice(0, 10);
  const content = normalizeLocalizedStringArray(payload?.content);
  const readTime = trimValue(payload?.readTime) || calculateReadTime(content.en);
  const coverImage = trimValue(payload?.coverImage);
  const likesCount = Number.isFinite(Number(payload?.likesCount)) ? Number(payload.likesCount) : 0;

  if (!title.en || !slug || !excerpt.en || !category || !coverImage || content.en.length === 0) {
    throw new Error("Please fill in all required blog fields.");
  }

  return {
    title,
    slug,
    excerpt,
    shortExcerpt,
    category,
    publishedAt: new Date(publishedAt),
    readTime,
    coverImage,
    content,
    likesCount: Math.max(0, likesCount),
  };
}

function normalizeSeedBlog(blog) {
  const title = normalizeLocalizedString(blog?.title);
  const excerpt = normalizeLocalizedString(blog?.excerpt);
  const shortExcerptRaw = normalizeLocalizedString(blog?.shortExcerpt);
  const shortExcerpt = {
    en: shortExcerptRaw.en || excerpt.en,
    zh: shortExcerptRaw.zh || excerpt.zh,
  };
  const content = normalizeLocalizedStringArray(blog?.content);

  return {
    ...blog,
    title,
    excerpt,
    shortExcerpt,
    content,
  };
}

function serializeSiteSettings(settings) {
  return {
    id: settings._id.toString(),
    heroImageUrl: settings.heroImageUrl || "",
    heroTitle: normalizeLocalizedString(settings.heroTitle),
    heroSubtitle: normalizeLocalizedString(settings.heroSubtitle),
    heroImages: [...(settings.heroImages || [])],
    heroPages: (settings.heroPages || []).map((page) => ({
      key: page.key,
      title: normalizeLocalizedString(page.title),
      subtitle: normalizeLocalizedString(page.subtitle),
      imageUrl: page.imageUrl || "",
      images: [...(page.images || [])],
    })),
    createdAt: settings.createdAt ? settings.createdAt.toISOString() : null,
    updatedAt: settings.updatedAt ? settings.updatedAt.toISOString() : null,
  };
}

const HERO_PAGE_KEYS = ["home", "services", "collection", "blogs", "about", "contact"];

function uniqueUrls(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => trimValue(value)).filter(Boolean))];
}

function normalizeHeroPages(settings) {
  let changed = false;

  const pages = Array.isArray(settings.heroPages) ? settings.heroPages.map((page) => toPlain(page)) : [];
  const byKey = new Map(pages.map((page) => [String(page.key || "").trim(), page]));

  for (const key of HERO_PAGE_KEYS) {
    if (!byKey.has(key)) {
      byKey.set(key, { key, title: { en: "", zh: "" }, subtitle: { en: "", zh: "" }, imageUrl: "", images: [] });
      changed = true;
    }
  }

  const home = byKey.get("home");
  const legacyHomeImages = uniqueUrls(settings.heroImages);
  const legacyHomeImageUrl = trimValue(settings.heroImageUrl);
  const legacyHomeTitle = normalizeLocalizedString(settings.heroTitle);
  const legacyHomeSubtitle = normalizeLocalizedString(settings.heroSubtitle);

  const homeTitle = normalizeLocalizedString(home.title);
  const homeSubtitle = normalizeLocalizedString(home.subtitle);

  if (!homeTitle.en && legacyHomeTitle.en) {
    homeTitle.en = legacyHomeTitle.en;
    changed = true;
  }
  if (!homeTitle.zh && legacyHomeTitle.zh) {
    homeTitle.zh = legacyHomeTitle.zh;
    changed = true;
  }
  if (!homeSubtitle.en && legacyHomeSubtitle.en) {
    homeSubtitle.en = legacyHomeSubtitle.en;
    changed = true;
  }
  if (!homeSubtitle.zh && legacyHomeSubtitle.zh) {
    homeSubtitle.zh = legacyHomeSubtitle.zh;
    changed = true;
  }
  home.title = homeTitle;
  home.subtitle = homeSubtitle;
  if (!home.imageUrl && legacyHomeImageUrl) {
    home.imageUrl = legacyHomeImageUrl;
    changed = true;
  }

  const mergedHomeImages = uniqueUrls([home.imageUrl, ...(home.images || []), ...legacyHomeImages]);
  if (JSON.stringify(uniqueUrls(home.images)) !== JSON.stringify(mergedHomeImages)) {
    home.images = mergedHomeImages;
    changed = true;
  }

  const normalizedPages = HERO_PAGE_KEYS.map((key) => {
    const page = byKey.get(key);
    const title = normalizeLocalizedString(page.title);
    const subtitle = normalizeLocalizedString(page.subtitle);
    return {
      key,
      title,
      subtitle,
      imageUrl: trimValue(page.imageUrl),
      images: uniqueUrls(page.images),
    };
  });

  if (JSON.stringify(toPlain(settings.heroPages || [])) !== JSON.stringify(normalizedPages)) {
    settings.heroPages = normalizedPages;
    changed = true;
  }

  const normalizedLegacyImages = uniqueUrls([legacyHomeImageUrl, ...legacyHomeImages]);
  if (JSON.stringify(normalizeLocalizedString(settings.heroTitle)) !== JSON.stringify(home.title)) {
    settings.heroTitle = home.title;
    changed = true;
  }
  if (JSON.stringify(normalizeLocalizedString(settings.heroSubtitle)) !== JSON.stringify(home.subtitle)) {
    settings.heroSubtitle = home.subtitle;
    changed = true;
  }
  if (trimValue(settings.heroImageUrl) !== home.imageUrl) {
    settings.heroImageUrl = home.imageUrl;
    changed = true;
  }
  if (JSON.stringify(uniqueUrls(settings.heroImages)) !== JSON.stringify(normalizedLegacyImages)) {
    settings.heroImages = normalizedLegacyImages;
    changed = true;
  }

  return { settings, changed };
}

function pickHeroPage(serializedSettings, pageKey, lang) {
  const key = HERO_PAGE_KEYS.includes(pageKey) ? pageKey : "home";
  const page = (serializedSettings.heroPages || []).find((item) => item.key === key);
  return {
    key,
    title: pickLocalizedString(page?.title, lang),
    subtitle: pickLocalizedString(page?.subtitle, lang),
    imageUrl: page?.imageUrl || "",
    images: uniqueUrls(page?.images || []),
  };
}

export async function getSiteSettings() {
  await connectToDatabase();

  let settings = await SiteSettings.findOne({ key: SITE_SETTINGS_KEY });
  if (!settings) {
    settings = await SiteSettings.create({ key: SITE_SETTINGS_KEY });
  }

  const normalized = normalizeHeroPages(settings);
  if (normalized.changed) {
    const patch = {
      heroPages: normalized.settings.heroPages,
      heroTitle: normalized.settings.heroTitle,
      heroSubtitle: normalized.settings.heroSubtitle,
      heroImageUrl: normalized.settings.heroImageUrl,
      heroImages: normalized.settings.heroImages,
    };
    settings = (await SiteSettings.findOneAndUpdate({ key: SITE_SETTINGS_KEY }, { $set: patch }, { new: true })) || normalized.settings;
  } else {
    settings = normalized.settings;
  }

  return serializeSiteSettings(settings);
}

export async function updateSiteSettings(payload) {
  await connectToDatabase();

  let settings = await SiteSettings.findOne({ key: SITE_SETTINGS_KEY });
  if (!settings) {
    settings = await SiteSettings.create({ key: SITE_SETTINGS_KEY });
  }

  const normalized = normalizeHeroPages(settings);
  settings = normalized.settings;

  const pageKey = trimValue(payload?.pageKey) || "home";
  if (pageKey && !HERO_PAGE_KEYS.includes(pageKey)) {
    throw new Error("Invalid page key.");
  }

  const heroImageUrl = payload && Object.prototype.hasOwnProperty.call(payload, "heroImageUrl")
    ? trimValue(payload.heroImageUrl)
    : null;
  const heroTitle = payload && Object.prototype.hasOwnProperty.call(payload, "heroTitle")
    ? normalizeLocalizedString(payload.heroTitle)
    : null;
  const heroSubtitle = payload && Object.prototype.hasOwnProperty.call(payload, "heroSubtitle")
    ? normalizeLocalizedString(payload.heroSubtitle)
    : null;
  const removeHeroImageUrl = trimValue(payload?.removeHeroImageUrl);

  const pages = Array.isArray(settings.heroPages) ? settings.heroPages.map((page) => toPlain(page)) : [];
  const updatedPages = pages.map((page) => {
    if (page.key !== pageKey) {
      return page;
    }

    const next = { ...page };
    if (heroTitle !== null) {
      next.title = heroTitle;
    }
    if (heroSubtitle !== null) {
      next.subtitle = heroSubtitle;
    }
    if (heroImageUrl !== null) {
      next.imageUrl = heroImageUrl;
      if (heroImageUrl) {
        next.images = uniqueUrls([heroImageUrl, ...(next.images || [])]);
      }
    }
    if (removeHeroImageUrl) {
      next.images = uniqueUrls((next.images || []).filter((url) => url !== removeHeroImageUrl));
      if (next.imageUrl === removeHeroImageUrl) {
        next.imageUrl = "";
      }
    }
    return next;
  });

  settings.heroPages = updatedPages;

  const normalizedAfter = normalizeHeroPages(settings);
  settings = normalizedAfter.settings;
  const patch = {
    heroPages: settings.heroPages,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    heroImageUrl: settings.heroImageUrl,
    heroImages: settings.heroImages,
  };
  settings = (await SiteSettings.findOneAndUpdate({ key: SITE_SETTINGS_KEY }, { $set: patch }, { new: true })) || settings;

  if (removeHeroImageUrl && isManagedUploadUrl(removeHeroImageUrl)) {
    await deleteManagedUpload(removeHeroImageUrl);
  }

  return serializeSiteSettings(settings);
}

export async function getHeroSettings(pageKey, lang) {
  const resolvedLang = lang || (await getRequestLanguage());
  const settings = await getSiteSettings();
  return pickHeroPage(settings, trimValue(pageKey) || "home", resolvedLang);
}

export async function getHomePageData() {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();

  const [featuredProducts, latestBlogs, hero, categoryDocuments] = await Promise.all([
    Product.find({ isFeatured: true }).sort({ updatedAt: -1 }).limit(6),
    Blog.find().sort({ publishedAt: -1 }).limit(3),
    getHeroSettings("home", lang),
    Category.find().sort({ slug: 1 }),
  ]);
  const categoryDisplayMap = buildCategoryDisplayMap(categoryDocuments, lang);

  return {
    heroImageUrl: hero.imageUrl || "",
    heroTitle: hero.title || "",
    heroSubtitle: hero.subtitle || "",
    featuredProducts: featuredProducts.map((product) => serializeProductPublic(product, lang, categoryDisplayMap)),
    latestBlogs: latestBlogs.map((blog) => serializeBlogPublic(blog, lang, categoryDisplayMap)),
  };
}

export async function getBlogsIndexPageData({ page = 1, pageSize = 6 } = {}) {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();

  const requestedPage = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || 6);

  const [totalCount, categoryValues] = await Promise.all([Blog.countDocuments(), Blog.distinct("category")]);
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const currentPage = Math.min(requestedPage, totalPages);
  const skip = (currentPage - 1) * size;

  const [blogs, recentBlogs, hero, categoryDocuments] = await Promise.all([
    Blog.find().sort({ publishedAt: -1 }).skip(skip).limit(size),
    Blog.find().sort({ publishedAt: -1 }).limit(6),
    getHeroSettings("blogs", lang),
    Category.find().sort({ slug: 1 }),
  ]);
  const categoryDisplayMap = buildCategoryDisplayMap(categoryDocuments, lang);

  const categories = [
    "All",
    ...Array.from(new Set((categoryValues || []).filter(Boolean)))
      .map((value) => categoryDisplayMap.get(value) || value)
      .sort((a, b) => a.localeCompare(b)),
  ];

  return {
    hero,
    pagination: {
      page: currentPage,
      pageSize: size,
      totalPages,
      totalCount,
    },
    blogs: blogs.map((blog) => serializeBlogPublic(blog, lang, categoryDisplayMap)),
    recentBlogs: recentBlogs.map((blog) => serializeBlogPublic(blog, lang, categoryDisplayMap)),
    categories,
  };
}

export async function getCollectionPageData() {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();

  const [products, categoryDocuments] = await Promise.all([
    Product.find({ showInCollection: true }).sort({ updatedAt: -1 }),
    Category.find().sort({ slug: 1 }),
  ]);
  const serializedProducts = products.map((product) => {
    const categoryKeys = getProductCategories(product);
    return {
      id: product._id.toString(),
      slug: product.slug,
      title: pickLocalizedString(product.title, lang),
      category: categoryKeys[0] || "",
      categories: categoryKeys,
      showInCollection: Boolean(product.showInCollection),
      isFeatured: Boolean(product.isFeatured),
      image: product.coverImage,
      coverImage: product.coverImage,
      media: (product.media || []).map((item) => ({
        kind: item.kind,
        url: item.url,
      })),
      description: pickLocalizedString(product.description, lang),
      moq: product.moq,
    };
  });

  const usedCategoryKeys = new Set(products.flatMap((product) => getProductCategories(product)));
  const orderedCategories = categoryDocuments
    .map((category) => {
      const name = normalizeLocalizedString(category.name);
      return {
        id: category._id.toString(),
        slug: category.slug,
        key: name.en || category.slug,
        name,
      };
    })
    .filter((category) => usedCategoryKeys.has(category.key));

  const orderedKeys = new Set(orderedCategories.map((category) => category.key));
  const extraCategories = [...usedCategoryKeys]
    .filter((key) => !orderedKeys.has(key))
    .sort()
    .map((key) => ({
      id: "",
      slug: slugify(key || ""),
      key,
      name: { en: key, zh: "" },
    }));

  const categories = [...orderedCategories, ...extraCategories];

  return {
    products: serializedProducts,
    categories,
  };
}

export async function getProductBySlug(slug) {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();
  const categoryDocuments = await Category.find().sort({ slug: 1 });
  const categoryDisplayMap = buildCategoryDisplayMap(categoryDocuments, lang);
  const trimmedSlug = trimValue(slug);
  const product = await Product.findOne({ $or: [{ slug: trimmedSlug }, { "variants.slug": trimmedSlug }] });
  if (!product) {
    return null;
  }

  const hasVariantMatch = (product.variants || []).some((variant) => trimValue(variant?.slug) === trimmedSlug);
  const selectedVariantSlug = hasVariantMatch ? trimmedSlug : product.slug;
  return serializeProductPublic(product, lang, categoryDisplayMap, selectedVariantSlug);
}

export async function getBlogBySlug(slug) {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();
  const categoryDocuments = await Category.find().sort({ slug: 1 });
  const categoryDisplayMap = buildCategoryDisplayMap(categoryDocuments, lang);
  const blog = await Blog.findOne({ slug });
  return blog ? serializeBlogPublic(blog, lang, categoryDisplayMap) : null;
}

export async function getBlogWithRelated(slug) {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();
  const categoryDocuments = await Category.find().sort({ slug: 1 });
  const categoryDisplayMap = buildCategoryDisplayMap(categoryDocuments, lang);

  const blog = await Blog.findOne({ slug });
  if (!blog) {
    return null;
  }

  const relatedBlogs = await Blog.find({ slug: { $ne: slug } }).sort({ publishedAt: -1 }).limit(3);

  return {
    post: serializeBlogPublic(blog, lang, categoryDisplayMap),
    relatedPosts: relatedBlogs.map((item) => serializeBlogPublic(item, lang, categoryDisplayMap)),
  };
}

export async function listProductsForAdmin() {
  await ensureContentSeeded();
  const products = await Product.find().sort({ updatedAt: -1 });
  return products.map((product) => serializeProductAdmin(product));
}

export async function getProductForAdminById(id) {
  await ensureContentSeeded();
  const product = await Product.findById(id);
  return product ? serializeProductAdmin(product) : null;
}

export async function createProduct(payload) {
  await ensureContentSeeded();
  const data = normalizeProductPayload(payload);
  await assertCategoriesExist(data.categories);

  const slugs = [data.slug, ...(data.variants || []).map((variant) => variant.slug)].filter(Boolean);
  const existingProduct = await Product.findOne({ $or: [{ slug: { $in: slugs } }, { "variants.slug": { $in: slugs } }] });
  if (existingProduct) {
    throw new Error("A product or variant with this slug already exists.");
  }

  const product = await Product.create(data);
  return serializeProductAdmin(product);
}

export async function updateProduct(id, payload) {
  await ensureContentSeeded();
  const existingProduct = await Product.findById(id);

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const data = normalizeProductPayload(payload);
  await assertCategoriesExist(data.categories);
  const slugs = [data.slug, ...(data.variants || []).map((variant) => variant.slug)].filter(Boolean);
  const slugConflict = await Product.findOne({
    _id: { $ne: id },
    $or: [{ slug: { $in: slugs } }, { "variants.slug": { $in: slugs } }],
  });
  if (slugConflict) {
    throw new Error("Another product already uses this slug.");
  }

  const oldUrls = collectProductManagedUrls(existingProduct);
  Object.assign(existingProduct, data);
  await existingProduct.save();

  const newUrls = collectProductManagedUrls(existingProduct);
  const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));
  await deleteManagedUploads(removedUrls);

  return serializeProductAdmin(existingProduct);
}

export async function deleteProductById(id) {
  await ensureContentSeeded();
  const product = await Product.findById(id);

  if (!product) {
    return;
  }

  const urls = collectProductManagedUrls(product);
  await Product.findByIdAndDelete(id);
  await deleteManagedUploads(urls);
}

export async function listBlogsForAdmin() {
  await ensureContentSeeded();
  const blogs = await Blog.find().sort({ publishedAt: -1 });
  return blogs.map((blog) => serializeBlogAdmin(blog));
}

export async function getBlogForAdminById(id) {
  await ensureContentSeeded();
  const blog = await Blog.findById(id);
  return blog ? serializeBlogAdmin(blog) : null;
}

export async function listCategoriesForAdmin() {
  await ensureContentSeeded();
  const categories = await Category.find().sort({ slug: 1 });
  return categories.map((category) => serializeCategoryAdmin(category));
}

export async function createCategory(payload) {
  await ensureContentSeeded();
  const name = normalizeLocalizedString(payload?.name);
  const slug = slugify(payload?.slug || name.en);

  if (!name.en) {
    throw new Error("English category name is required.");
  }

  const existingCategory = await Category.findOne({
    $or: [{ slug }, { "name.en": name.en }, { name: name.en }],
  });

  if (existingCategory) {
    throw new Error("A category with this name already exists.");
  }

  const category = await Category.create({ name, slug });
  return serializeCategoryAdmin(category);
}

export async function updateCategory(id, payload) {
  await ensureContentSeeded();
  const name = normalizeLocalizedString(payload?.name);
  const slug = slugify(payload?.slug || name.en);

  if (!name.en) {
    throw new Error("English category name is required.");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new Error("Category not found.");
  }

  const existingCategory = await Category.findOne({
    _id: { $ne: id },
    $or: [{ slug }, { "name.en": name.en }, { name: name.en }],
  });

  if (existingCategory) {
    throw new Error("Another category already uses this name.");
  }

  const previousName = getCategoryKeyFromDocument(category);
  category.name = name;
  category.slug = slug;
  await category.save();

  if (previousName !== name.en) {
    const products = await Product.find({ categories: previousName });

    await Promise.all(
      products.map(async (product) => {
        const nextCategories = getProductCategories(product).map((item) => (item === previousName ? name.en : item));
        product.categories = uniqueStringArray(nextCategories);
        product.category = product.categories[0] || "";
        await product.save();
      }),
    );
  }

  return serializeCategoryAdmin(category);
}

export async function deleteCategoryById(id) {
  await ensureContentSeeded();
  const category = await Category.findById(id);

  if (!category) {
    return;
  }

  const assignedProductsCount = await Product.countDocuments({ categories: getCategoryKeyFromDocument(category) });
  if (assignedProductsCount > 0) {
    throw new Error("This category is used by products. Update those products before deleting it.");
  }

  await Category.findByIdAndDelete(id);
}

export async function createBlog(payload) {
  await ensureContentSeeded();
  const data = normalizeBlogPayload(payload);

  const existingBlog = await Blog.findOne({ slug: data.slug });
  if (existingBlog) {
    throw new Error("A blog with this slug already exists.");
  }

  const blog = await Blog.create({
    ...data,
    comments: [],
  });

  return serializeBlogAdmin(blog);
}

export async function updateBlog(id, payload) {
  await ensureContentSeeded();
  const existingBlog = await Blog.findById(id);

  if (!existingBlog) {
    throw new Error("Blog not found.");
  }

  const data = normalizeBlogPayload(payload);
  const slugConflict = await Blog.findOne({ slug: data.slug, _id: { $ne: id } });
  if (slugConflict) {
    throw new Error("Another blog already uses this slug.");
  }

  const oldUrls = collectBlogManagedUrls(existingBlog);
  Object.assign(existingBlog, data);
  await existingBlog.save();

  const newUrls = collectBlogManagedUrls(existingBlog);
  const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));
  await deleteManagedUploads(removedUrls);

  return serializeBlogAdmin(existingBlog);
}

export async function deleteBlogById(id) {
  await ensureContentSeeded();
  const blog = await Blog.findById(id);

  if (!blog) {
    return;
  }

  const urls = collectBlogManagedUrls(blog);
  await Blog.findByIdAndDelete(id);
  await deleteManagedUploads(urls);
}

export async function incrementBlogLike(slug) {
  await ensureContentSeeded();
  const blog = await Blog.findOneAndUpdate({ slug }, { $inc: { likesCount: 1 } }, { new: true });

  if (!blog) {
    throw new Error("Blog not found.");
  }

  return {
    likesCount: blog.likesCount,
  };
}

export async function decrementBlogLike(slug) {
  await ensureContentSeeded();
  const blog = await Blog.findOne({ slug });

  if (!blog) {
    throw new Error("Blog not found.");
  }

  blog.likesCount = Math.max(0, (blog.likesCount || 0) - 1);
  await blog.save();

  return {
    likesCount: blog.likesCount,
  };
}

export async function addBlogComment(slug, payload) {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();
  const name = trimValue(payload?.name);
  const text = trimValue(payload?.text);

  if (!name || !text) {
    throw new Error("Name and comment are required.");
  }

  const blog = await Blog.findOne({ slug });
  if (!blog) {
    throw new Error("Blog not found.");
  }

  blog.comments.push({
    name,
    text,
    createdAt: new Date(),
  });

  await blog.save();

  const latestComment = blog.comments[blog.comments.length - 1];

  return {
    comment: {
      id: latestComment._id.toString(),
      name: latestComment.name,
      text: latestComment.text,
      date: formatDisplayDate(latestComment.createdAt, lang),
      createdAt: new Date(latestComment.createdAt).toISOString(),
      replies: [],
    },
    commentsCount: blog.comments.length,
  };
}

export async function addAdminReplyToComment(blogId, commentId, payload, adminName) {
  await ensureContentSeeded();
  const text = trimValue(payload?.text);

  if (!text) {
    throw new Error("Reply text is required.");
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found.");
  }

  const comment = blog.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found.");
  }

  comment.replies.push({
    authorName: trimValue(adminName) || "Admin",
    text,
    createdAt: new Date(),
  });

  await blog.save();

  const latestReply = comment.replies[comment.replies.length - 1];

  return {
    reply: {
      id: latestReply._id.toString(),
      authorName: latestReply.authorName,
      text: latestReply.text,
      createdAt: new Date(latestReply.createdAt).toISOString(),
      date: formatDisplayDate(latestReply.createdAt, "en"),
    },
  };
}

export async function deleteCommentById(blogId, commentId) {
  await ensureContentSeeded();

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found.");
  }

  const comment = blog.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found.");
  }

  comment.deleteOne();
  await blog.save();

  return { success: true };
}

export async function deleteReplyById(blogId, commentId, replyId) {
  await ensureContentSeeded();

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found.");
  }

  const comment = blog.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found.");
  }

  const reply = comment.replies.id(replyId);
  if (!reply) {
    throw new Error("Reply not found.");
  }

  reply.deleteOne();
  await blog.save();

  return { success: true };
}

export function parseFeatureLines(value) {
  return cleanStringArray(String(value || "").split("\n"));
}

export function parseSpecLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: trimValue(label),
        value: trimValue(rest.join(":")),
      };
    })
    .filter((item) => item.label && item.value);
}

export function parseParagraphs(value) {
  return cleanStringArray(
    String(value || "")
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\n/g, " ").trim()),
  );
}

export function joinLines(values) {
  return cleanStringArray(values).join("\n");
}

export function joinSpecLines(values) {
  return cleanSpecs(values)
    .map((item) => `${item.label}: ${item.value}`)
    .join("\n");
}

export function joinParagraphs(values) {
  return cleanStringArray(values).join("\n\n");
}

export function clonePlain(value) {
  return toPlain(value);
}
