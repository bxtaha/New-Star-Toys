import { notFound } from "next/navigation";
import BlogEditorForm from "@/components/admin/BlogEditorForm";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { getBlogForAdminById } from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function EditAdminBlogPage({ params }) {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const { id } = await params;
  const blog = await getBlogForAdminById(id);

  if (!blog) {
    notFound();
  }

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.blogs.editTitle")}
      description={t("admin.blogs.editDescription")}
    >
      <BlogEditorForm mode="edit" blog={blog} />
    </AdminShell>
  );
}
