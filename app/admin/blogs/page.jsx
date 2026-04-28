import AdminBlogsManager from "@/components/admin/AdminBlogsManager";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { listBlogsForAdmin } from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const blogs = await listBlogsForAdmin();

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.blogs.title")}
      description={t("admin.blogs.description")}
    >
      <AdminBlogsManager initialBlogs={blogs} />
    </AdminShell>
  );
}
