import AdminCategoriesManager from "@/components/admin/AdminCategoriesManager";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { listCategoriesForAdmin } from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const categories = await listCategoriesForAdmin();

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.categories.title")}
      description={t("admin.categories.description")}
    >
      <AdminCategoriesManager initialCategories={categories} />
    </AdminShell>
  );
}
