import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getCloudinaryConfig, isCloudinaryAssetUrl, isCloudinaryConfigured, deleteCloudinaryByUrl, uploadToCloudinary } from "@/lib/server/cloudinary";

const DEFAULT_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

function getUploadRoot() {
  const configured = String(process.env.UPLOAD_STORAGE_DIR || "").trim();
  return configured ? path.resolve(configured) : DEFAULT_UPLOAD_ROOT;
}

function sanitizeSegment(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getExtension(fileName) {
  const extension = path.extname(fileName || "").toLowerCase();
  return extension || "";
}

export function isManagedUploadUrl(url) {
  return typeof url === "string" && url.startsWith("/uploads/");
}

export async function saveUploadedFiles({ files, folder, entitySlug = "" }) {
  const safeFolder = sanitizeSegment(folder);
  const safeEntity = sanitizeSegment(entitySlug) || "shared";

  if (isCloudinaryConfigured()) {
    const config = getCloudinaryConfig();
    const cloudFolder = [config?.rootFolder, safeFolder, safeEntity].filter(Boolean).join("/");
    const savedFiles = [];

    for (const file of files) {
      const result = await uploadToCloudinary({ file, folder: cloudFolder });
      savedFiles.push(result);
    }

    return savedFiles;
  }

  const uploadRoot = getUploadRoot();
  const targetDirectory = path.join(uploadRoot, safeFolder, safeEntity);

  await mkdir(targetDirectory, { recursive: true });

  const savedFiles = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = getExtension(file.name);
    const uniqueName = `${Date.now()}-${randomUUID()}${extension}`;
    const absolutePath = path.join(targetDirectory, uniqueName);
    const relativePath = `/uploads/${safeFolder}/${safeEntity}/${uniqueName}`;

    await writeFile(absolutePath, buffer);

    savedFiles.push({
      url: relativePath,
      kind: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
    });
  }

  return savedFiles;
}

export async function deleteManagedUpload(url) {
  if (!isManagedUploadUrl(url)) {
    return;
  }

  const safeRelativePath = path
    .normalize(url.replace(/^\/uploads\//, ""))
    .replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(getUploadRoot(), safeRelativePath);

  try {
    await unlink(absolutePath);
  } catch {
    return;
  }
}

export async function deleteManagedUploads(urls) {
  await Promise.all(urls.map((url) => deleteManagedUpload(url)));
}

export async function readManagedUpload(relativePath) {
  const safeRelativePath = path
    .normalize(String(relativePath || ""))
    .replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(getUploadRoot(), safeRelativePath);
  return readFile(absolutePath);
}

export async function deleteMediaUrl(url) {
  if (isManagedUploadUrl(url)) {
    await deleteManagedUpload(url);
    return { deleted: true, provider: "local" };
  }
  if (isCloudinaryAssetUrl(url)) {
    await deleteCloudinaryByUrl(url);
    return { deleted: true, provider: "cloudinary" };
  }
  return { deleted: false, provider: "unknown" };
}

export async function deleteMediaUrls(urls) {
  await Promise.all((Array.isArray(urls) ? urls : []).map((url) => deleteMediaUrl(url)));
}
