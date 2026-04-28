import AdminProductsManager from "@/components/admin/AdminProductsManager";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { listProductsForAdmin } from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const products = await listProductsForAdmin();

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.products.title")}
      description={t("admin.products.description")}
    >
      <AdminProductsManager initialProducts={products} />
    </AdminShell>
  );
}
