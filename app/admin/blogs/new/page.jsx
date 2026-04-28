import BlogEditorForm from "@/components/admin/BlogEditorForm";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function NewAdminBlogPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.blogs.createTitle")}
      description={t("admin.blogs.createDescription")}
    >
      <BlogEditorForm mode="create" />
    </AdminShell>
  );
}
