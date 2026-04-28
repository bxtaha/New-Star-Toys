import AdminDashboardHome from "@/components/admin/AdminDashboardHome";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { listAdmins, requireAdmin } from "@/lib/server/auth";
import {
  listBlogsForAdmin,
  listCategoriesForAdmin,
  listProductsForAdmin,
} from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const [admins, products, blogs, categories] = await Promise.all([
    listAdmins(),
    listProductsForAdmin(),
    listBlogsForAdmin(),
    listCategoriesForAdmin(),
  ]);

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.dashboard.title")}
      description={t("admin.dashboard.description")}
    >
      <AdminDashboardHome
        currentAdmin={currentAdmin}
        initialAdmins={admins}
        initialProducts={products}
        initialBlogs={blogs}
        initialCategories={categories}
      />
    </AdminShell>
  );
}
