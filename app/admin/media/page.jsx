import AdminShell from "@/components/admin/AdminShell";
import AdminMediaManager from "@/components/admin/AdminMediaManager";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { listMediaForAdmin } from "@/lib/server/media";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const initial = await listMediaForAdmin({ page: 1, pageSize: 60 });

  return (
    <AdminShell currentAdmin={currentAdmin} title={t("admin.media.title")} description={t("admin.media.description")}>
      <AdminMediaManager initialMedia={initial.media} initialPagination={initial.pagination} initialSummary={initial.summary} />
    </AdminShell>
  );
}
