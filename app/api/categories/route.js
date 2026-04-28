import { NextResponse } from "next/server";
import { getRequestLanguage } from "@/lib/server/request-language";
import { ensureContentSeeded } from "@/lib/server/content";
import { Category } from "@/models/Category";
import { normalizeLocalizedString, pickLocalizedString } from "@/lib/i18n/localized";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureContentSeeded();
  const lang = await getRequestLanguage();
  const categories = await Category.find().sort({ slug: 1 });

  return NextResponse.json({
    categories: categories.map((category) => {
      const name = normalizeLocalizedString(category.name);
      return {
        id: category._id.toString(),
        slug: category.slug,
        key: name.en || category.slug,
        name,
        label: pickLocalizedString(name, lang),
      };
    }),
  });
}
