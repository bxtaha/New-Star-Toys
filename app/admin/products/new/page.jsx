import ProductEditorForm from "@/components/admin/ProductEditorForm";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { listCategoriesForAdmin } from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function NewAdminProductPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const categories = await listCategoriesForAdmin();

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.products.createTitle")}
      description={t("admin.products.createDescription")}
    >
      <ProductEditorForm mode="create" categories={categories} />
    </AdminShell>
  );
}
