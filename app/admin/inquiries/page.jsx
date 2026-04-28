import AdminShell from "@/components/admin/AdminShell";
import AdminInquiriesManager from "@/components/admin/AdminInquiriesManager";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { listInquiriesForAdmin } from "@/lib/server/inquiries";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const initial = await listInquiriesForAdmin({ page: 1, pageSize: 20 });

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.inquiries.title")}
      description={t("admin.inquiries.description")}
    >
      <AdminInquiriesManager initialInquiries={initial.inquiries} initialPagination={initial.pagination} />
    </AdminShell>
  );
}
