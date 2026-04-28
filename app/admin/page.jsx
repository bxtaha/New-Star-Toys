import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { ensureDefaultAdmin, getCurrentAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  await ensureDefaultAdmin();
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
