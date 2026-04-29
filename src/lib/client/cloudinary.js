function trimValue(value) {
  return String(value || "").trim();
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

export function cloudinaryTransformUrl(src, { width, quality } = {}) {
  const value = trimValue(src);
  if (!isCloudinaryAssetUrl(value)) {
    return value;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return value;
  }

  const pathname = parsed.pathname || "";
  const uploadIndex = pathname.indexOf("/upload/");
  if (uploadIndex === -1) {
    return value;
  }

  const before = pathname.slice(0, uploadIndex + "/upload/".length);
  const after = pathname.slice(uploadIndex + "/upload/".length).replace(/^\/+/, "");

  const parts = ["f_auto", "q_auto"];
  const w = Number(width);
  if (Number.isFinite(w) && w > 0) {
    parts.push(`c_limit`, `w_${Math.round(w)}`);
  }
  const q = Number(quality);
  if (Number.isFinite(q) && q > 0 && q <= 100) {
    parts[1] = `q_${Math.round(q)}`;
  }

  parsed.pathname = `${before}${parts.join(",")}/${after}`;
  return parsed.toString();
}

export function cloudinaryLoader({ src, width, quality }) {
  return cloudinaryTransformUrl(src, { width, quality });
}

