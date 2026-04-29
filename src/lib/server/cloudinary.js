import crypto from "crypto";

function trimValue(value) {
  return String(value || "").trim();
}

function parseCloudinaryUrl(raw) {
  const value = trimValue(raw);
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    const cloudName = trimValue(url.hostname);
    const apiKey = trimValue(decodeURIComponent(url.username || ""));
    const apiSecret = trimValue(decodeURIComponent(url.password || ""));
    if (!cloudName || !apiKey || !apiSecret) {
      return null;
    }
    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

export function getCloudinaryConfig() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloudName = trimValue(process.env.CLOUDINARY_CLOUD_NAME || fromUrl?.cloudName);
  const apiKey = trimValue(process.env.CLOUDINARY_API_KEY || fromUrl?.apiKey);
  const apiSecret = trimValue(process.env.CLOUDINARY_API_SECRET || fromUrl?.apiSecret);
  const rootFolder = trimValue(process.env.CLOUDINARY_ROOT_FOLDER) || "new_star_toys";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret, rootFolder };
}

export function isCloudinaryConfigured() {
  return Boolean(getCloudinaryConfig());
}

export function isCloudinaryAssetUrl(url) {
  const value = trimValue(url);
  if (!value) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

function sha1(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function signParams(params, apiSecret) {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v) !== "")
    .map(([k, v]) => [String(k), String(v)]);
  pairs.sort(([a], [b]) => a.localeCompare(b));
  const toSign = pairs.map(([k, v]) => `${k}=${v}`).join("&");
  return sha1(`${toSign}${apiSecret}`);
}

function resourceTypeForFileType(fileType) {
  return trimValue(fileType).startsWith("video/") ? "video" : "image";
}

export function cloudinaryPublicIdFromUrl(url) {
  const value = trimValue(url);
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname || "";
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) {
      return "";
    }
    let tail = pathname.slice(uploadIndex + "/upload/".length);
    tail = tail.replace(/^\/+/, "");

    const segments = tail.split("/").filter(Boolean);
    if (segments.length === 0) {
      return "";
    }

    if (/^v\d+$/.test(segments[0])) {
      segments.shift();
    }

    if (segments.length === 0) {
      return "";
    }

    const last = segments[segments.length - 1] || "";
    const dot = last.lastIndexOf(".");
    if (dot > 0) {
      segments[segments.length - 1] = last.slice(0, dot);
    }

    return segments.join("/");
  } catch {
    return "";
  }
}

function resourceTypeFromCloudinaryUrl(url) {
  const value = trimValue(url);
  if (!value) {
    return "image";
  }
  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname || "";
    if (pathname.includes("/video/upload/")) {
      return "video";
    }
    return "image";
  } catch {
    return "image";
  }
}

export async function uploadToCloudinary({ file, folder, publicId }) {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary is not configured.");
  }

  const resourceType = resourceTypeForFileType(file?.type);
  const timestamp = Math.floor(Date.now() / 1000);
  const safeFolder = trimValue(folder);

  const paramsToSign = {
    folder: safeFolder,
    timestamp,
    ...(publicId ? { public_id: publicId } : {}),
  };

  const signature = signParams(paramsToSign, config.apiSecret);

  const bytes = await file.arrayBuffer();
  const blob = new Blob([bytes], { type: file.type || "application/octet-stream" });

  const formData = new FormData();
  formData.append("file", blob, file.name || `upload-${Date.now()}`);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  if (safeFolder) {
    formData.append("folder", safeFolder);
  }
  if (publicId) {
    formData.append("public_id", publicId);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed.");
  }

  return {
    url: data.secure_url,
    kind: resourceType === "video" ? "video" : "image",
    name: file.name || "",
    bytes: Number(data.bytes) || 0,
    publicId: data.public_id || "",
    provider: "cloudinary",
  };
}

async function fetchCloudinaryAdmin(pathname) {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary is not configured.");
  }

  const token = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}${pathname}`, {
    headers: { Authorization: `Basic ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary admin request failed.");
  }
  return data;
}

export async function listCloudinaryResources({ prefix = "", resourceType = "image", maxResults = 100 } = {}) {
  const safePrefix = trimValue(prefix);
  const max = Math.min(500, Math.max(1, Number(maxResults) || 100));
  const type = resourceType === "video" ? "video" : "image";

  const params = new URLSearchParams();
  if (safePrefix) {
    params.set("prefix", safePrefix);
  }
  params.set("max_results", String(max));

  const data = await fetchCloudinaryAdmin(`/resources/${type}/upload?${params.toString()}`);
  const resources = Array.isArray(data?.resources) ? data.resources : [];

  return resources.map((item) => ({
    url: item.secure_url || "",
    kind: type === "video" ? "video" : "image",
    folder: trimValue(item.folder),
    fileName: trimValue(item.filename) ? `${item.filename}.${item.format || ""}`.replace(/\.$/, "") : "",
    bytes: Number(item.bytes) || 0,
    updatedAt: item.created_at || null,
    publicId: item.public_id || "",
    provider: "cloudinary",
  }));
}

export async function deleteCloudinaryByPublicId({ publicId, resourceType = "image" }) {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary is not configured.");
  }

  const type = resourceType === "video" ? "video" : "image";
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { public_id: publicId, timestamp };
  const signature = signParams(paramsToSign, config.apiSecret);

  const body = new URLSearchParams();
  body.set("public_id", publicId);
  body.set("api_key", config.apiKey);
  body.set("timestamp", String(timestamp));
  body.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${type}/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary delete failed.");
  }

  return { result: data.result || "" };
}

export async function deleteCloudinaryByUrl(url) {
  const publicId = cloudinaryPublicIdFromUrl(url);
  if (!publicId) {
    throw new Error("Invalid Cloudinary url.");
  }

  const primaryType = resourceTypeFromCloudinaryUrl(url);
  const first = await deleteCloudinaryByPublicId({ publicId, resourceType: primaryType });
  if (first.result !== "not found") {
    return first;
  }

  const fallbackType = primaryType === "video" ? "image" : "video";
  return deleteCloudinaryByPublicId({ publicId, resourceType: fallbackType });
}

