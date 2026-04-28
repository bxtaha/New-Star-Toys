import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/auth";
import { saveUploadedFiles } from "@/lib/server/uploads";
import { slugify } from "@/lib/server/content";

export async function POST(request) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const type = formData.get("type");
    const entitySlug = slugify(formData.get("entitySlug") || "shared");
    const rawFiles = formData.getAll("files").filter(Boolean);

    if (!["products", "blogs", "site"].includes(type)) {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }

    if (rawFiles.length === 0) {
      return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });
    }

    for (const file of rawFiles) {
      if (!(file.type.startsWith("image/") || file.type.startsWith("video/"))) {
        return NextResponse.json({ error: "Only image and video files are allowed." }, { status: 400 });
      }
    }

    const files = await saveUploadedFiles({
      files: rawFiles,
      folder: type,
      entitySlug,
    });

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Upload failed." }, { status: 500 });
  }
}
