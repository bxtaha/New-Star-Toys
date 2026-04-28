import { notFound } from "next/navigation";
import ProductEditorForm from "@/components/admin/ProductEditorForm";
import AdminShell from "@/components/admin/AdminShell";
import { tFor } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { getProductForAdminById, listCategoriesForAdmin } from "@/lib/server/content";
import { getRequestLanguage } from "@/lib/server/request-language";

export const dynamic = "force-dynamic";

export default async function EditAdminProductPage({ params }) {
  const lang = await getRequestLanguage();
  const t = tFor(lang);
  const currentAdmin = await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductForAdminById(id),
    listCategoriesForAdmin(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      title={t("admin.products.editTitle")}
      description={t("admin.products.editDescription")}
    >
      <ProductEditorForm mode="edit" product={product} categories={categories} />
    </AdminShell>
  );
}
