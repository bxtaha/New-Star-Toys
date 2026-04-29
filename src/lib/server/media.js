import path from "path";
import { readdir, stat } from "fs/promises";
import { connectToDatabase } from "@/lib/server/db";
import { isManagedUploadUrl } from "@/lib/server/uploads";
import { getCloudinaryConfig, isCloudinaryAssetUrl, isCloudinaryConfigured, listCloudinaryResources } from "@/lib/server/cloudinary";
import { ensureContentSeeded } from "@/lib/server/content";
import { Product } from "@/models/Product";
import { Blog } from "@/models/Blog";
import { SiteSettings } from "@/models/SiteSettings";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"]);

function trimValue(value) {
  return String(value || "").trim();
}

function normalizeRelPath(value) {
  return trimValue(value).replace(/\\/g, "/").replace(/^\/+/, "");
}

function isSafeRelPath(value) {
  const rel = normalizeRelPath(value);
  if (!rel || rel.includes("\0")) {
    return false;
  }
  const normalized = path.posix.normalize(rel);
  return !normalized.startsWith("..");
}

function kindForFileName(fileName) {
  const ext = path.extname(fileName || "").toLowerCase();
  if (VIDEO_EXTENSIONS.has(ext)) {
    return "video";
  }
  if (IMAGE_EXTENSIONS.has(ext)) {
    return "image";
  }
  return "file";
}

function getUploadRoot() {
  const configured = trimValue(process.env.UPLOAD_STORAGE_DIR);
  return configured ? path.resolve(configured) : path.join(process.cwd(), "public", "uploads");
}

function isManagedMediaUrl(url) {
  return isManagedUploadUrl(url) || isCloudinaryAssetUrl(url);
}

async function walkFiles(baseDir) {
  const results = [];

  async function walk(currentDir) {
    let entries = [];
    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
          return;
        }
        if (!entry.isFile()) {
          return;
        }
        results.push(fullPath);
      }),
    );
  }

  await walk(baseDir);
  return results;
}

async function collectUsedUrls() {
  await ensureContentSeeded();
  await connectToDatabase();

  const used = new Set();

  const [products, blogs, settings] = await Promise.all([
    Product.find({}, { coverImage: 1, media: 1 }).lean(),
    Blog.find({}, { coverImage: 1 }).lean(),
    SiteSettings.findOne({}, { heroImageUrl: 1, heroPages: 1, heroImages: 1 }).lean(),
  ]);

  for (const product of products || []) {
    const cover = trimValue(product?.coverImage);
    if (isManagedMediaUrl(cover)) {
      used.add(cover);
    }
    for (const media of product?.media || []) {
      const url = trimValue(media?.url);
      if (isManagedMediaUrl(url)) {
        used.add(url);
      }
    }
  }

  for (const blog of blogs || []) {
    const cover = trimValue(blog?.coverImage);
    if (isManagedMediaUrl(cover)) {
      used.add(cover);
    }
  }

  if (settings) {
    const heroImageUrl = trimValue(settings?.heroImageUrl);
    if (isManagedMediaUrl(heroImageUrl)) {
      used.add(heroImageUrl);
    }
    for (const hero of settings?.heroImages || []) {
      const url = trimValue(hero?.imageUrl || hero);
      if (isManagedMediaUrl(url)) {
        used.add(url);
      }
    }
    for (const page of settings?.heroPages || []) {
      const imageUrl = trimValue(page?.imageUrl);
      if (isManagedMediaUrl(imageUrl)) {
        used.add(imageUrl);
      }
      for (const urlValue of page?.images || []) {
        const url = trimValue(urlValue);
        if (isManagedMediaUrl(url)) {
          used.add(url);
        }
      }
    }
  }

  return used;
}

export async function listMediaForAdmin({
  page = 1,
  pageSize = 60,
  query = "",
  status = "",
  kind = "",
  folder = "",
} = {}) {
  const uploadRoot = getUploadRoot();
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(200, Math.max(1, Number(pageSize) || 60));
  const q = trimValue(query).toLowerCase();
  const statusFilter = trimValue(status);
  const kindFilter = trimValue(kind);
  const folderFilter = trimValue(folder);

  const [files, usedUrls] = await Promise.all([walkFiles(uploadRoot), collectUsedUrls()]);

  const items = [];
  await Promise.all(
    files.map(async (absolutePath) => {
      const rel = normalizeRelPath(path.relative(uploadRoot, absolutePath));
      if (!isSafeRelPath(rel)) {
        return;
      }
      const url = `/uploads/${rel}`;
      const detectedKind = kindForFileName(rel);
      if (kindFilter && detectedKind !== kindFilter) {
        return;
      }
      if (folderFilter) {
        const top = rel.split("/")[0] || "";
        if (top !== folderFilter) {
          return;
        }
      }
      if (q && !rel.toLowerCase().includes(q)) {
        return;
      }
      let info = null;
      try {
        info = await stat(absolutePath);
      } catch {
        return;
      }
      const isUsed = usedUrls.has(url);
      if (statusFilter === "used" && !isUsed) {
        return;
      }
      if (statusFilter === "unused" && isUsed) {
        return;
      }
      const segments = rel.split("/");
      const folderName = segments[0] || "";
      const entitySlug = segments[1] || "";
      const fileName = segments.slice(2).join("/") || segments[segments.length - 1] || "";
      items.push({
        url,
        kind: detectedKind,
        folder: folderName,
        entitySlug,
        fileName,
        bytes: info.size || 0,
        updatedAt: info.mtime ? info.mtime.toISOString() : null,
        used: isUsed,
        provider: "local",
      });
    }),
  );

  if (isCloudinaryConfigured()) {
    const config = getCloudinaryConfig();
    const rootFolder = trimValue(config?.rootFolder);
    const prefix = rootFolder ? `${rootFolder}/` : "";

    const [images, videos] = await Promise.all([
      listCloudinaryResources({ prefix, resourceType: "image", maxResults: 500 }),
      listCloudinaryResources({ prefix, resourceType: "video", maxResults: 500 }),
    ]);

    const all = [...images, ...videos];
    for (const asset of all) {
      const assetUrl = trimValue(asset.url);
      if (!assetUrl) {
        continue;
      }

      const fullFolder = trimValue(asset.folder);
      const folderSegments = fullFolder.split("/").filter(Boolean);
      const rootIndex = rootFolder ? folderSegments.indexOf(rootFolder) : -1;
      const folderName = folderSegments[rootIndex >= 0 ? rootIndex + 1 : 0] || "";
      const entitySlug = folderSegments[rootIndex >= 0 ? rootIndex + 2 : 1] || "";
      const fileName = trimValue(asset.fileName) || trimValue(asset.publicId).split("/").pop() || "";
      const detectedKind = asset.kind === "video" ? "video" : "image";

      if (kindFilter && detectedKind !== kindFilter) {
        continue;
      }
      if (folderFilter && folderName !== folderFilter) {
        continue;
      }

      const searchable = [folderName, entitySlug, fileName, assetUrl, asset.publicId].filter(Boolean).join("/");
      if (q && !searchable.toLowerCase().includes(q)) {
        continue;
      }

      const isUsed = usedUrls.has(assetUrl);
      if (statusFilter === "used" && !isUsed) {
        continue;
      }
      if (statusFilter === "unused" && isUsed) {
        continue;
      }

      items.push({
        url: assetUrl,
        kind: detectedKind,
        folder: folderName,
        entitySlug,
        fileName,
        bytes: Number(asset.bytes) || 0,
        updatedAt: asset.updatedAt || null,
        used: isUsed,
        provider: "cloudinary",
      });
    }
  }

  items.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safePageSize;
  const paged = items.slice(start, start + safePageSize);

  return {
    media: paged,
    summary: {
      totalCount,
      usedCount: items.filter((item) => item.used).length,
      unusedCount: items.filter((item) => !item.used).length,
    },
    pagination: {
      page: currentPage,
      pageSize: safePageSize,
      totalPages,
      totalCount,
    },
  };
}

export async function canDeleteMediaUrl(url) {
  const usedUrls = await collectUsedUrls();
  const normalized = trimValue(url);
  if (!isManagedMediaUrl(normalized)) {
    return { allowed: false, used: false };
  }
  return { allowed: !usedUrls.has(normalized), used: usedUrls.has(normalized) };
}
