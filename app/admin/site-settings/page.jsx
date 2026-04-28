import AdminHeroManager from "@/components/admin/AdminHeroManager";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { getSiteSettings } from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.siteSettings.title")}
      description={t("admin.siteSettings.description")}
    >
      <AdminHeroManager initialSiteSettings={settings} />
    </AdminShell>
  );
}
