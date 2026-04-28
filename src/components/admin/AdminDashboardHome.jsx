"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Loader2, Newspaper, Package, Pencil, Plus, Star, Tags, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { normalizeLocalizedString } from "@/lib/i18n/localized";
import { useI18n } from "@/components/I18nProvider";

const emptyAdminForm = {
  name: "",
  email: "",
  password: "",
};

const emptyCategoryForm = {
  name: { en: "", zh: "" },
};

const AdminDashboardHome = ({
  initialAdmins,
  initialCategories,
  initialProducts,
  initialBlogs,
  currentAdmin,
}) => {
  const { t } = useI18n();
  const [admins, setAdmins] = useState(initialAdmins);
  const [categories, setCategories] = useState(initialCategories);
  const [products] = useState(initialProducts);
  const [blogs] = useState(initialBlogs);

  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const stats = useMemo(() => {
    const featuredCount = products.filter((product) => product.isFeatured).length;
    const collectionCount = products.filter((product) => product.showInCollection).length;
    const totalComments = blogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0);

    return {
      admins: admins.length,
      categories: categories.length,
      products: products.length,
      featuredProducts: featuredCount,
      collectionProducts: collectionCount,
      blogs: blogs.length,
      comments: totalComments,
    };
  }, [admins, categories, products, blogs]);

  const resetAdminForm = () => {
    setAdminForm(emptyAdminForm);
    setEditingAdminId(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const refreshAdmins = async () => {
    const response = await fetch("/api/admin/admins");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t("admin.dashboard.error.loadAdmins"));
    }

    setAdmins(data.admins);
  };

  const refreshCategories = async () => {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t("admin.dashboard.error.loadCategories"));
    }

    setCategories(data.categories);
  };

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setAdminSubmitting(true);

    try {
      const url = editingAdminId ? `/api/admin/admins/${editingAdminId}` : "/api/admin/admins";
      const method = editingAdminId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.dashboard.error.saveAdmin"));
      }

      await refreshAdmins();
      resetAdminForm();
      toast.success(editingAdminId ? t("admin.dashboard.toast.adminUpdated") : t("admin.dashboard.toast.adminCreated"));
    } catch (error) {
      toast.error(error.message || t("admin.dashboard.error.saveAdmin"));
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    const shouldDelete = window.confirm(t("admin.dashboard.confirmDeleteAdmin"));
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.dashboard.error.deleteAdmin"));
      }

      await refreshAdmins();
      if (editingAdminId === adminId) {
        resetAdminForm();
      }
      toast.success(t("admin.dashboard.toast.adminDeleted"));
    } catch (error) {
      toast.error(error.message || t("admin.dashboard.error.deleteAdmin"));
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setCategorySubmitting(true);

    try {
      const url = editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : "/api/admin/categories";
      const method = editingCategoryId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.dashboard.error.saveCategory"));
      }

      await refreshCategories();
      resetCategoryForm();
      toast.success(
        editingCategoryId ? t("admin.dashboard.toast.categoryUpdated") : t("admin.dashboard.toast.categoryCreated"),
      );
    } catch (error) {
      toast.error(error.message || t("admin.dashboard.error.saveCategory"));
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const shouldDelete = window.confirm(t("admin.dashboard.confirmDeleteCategory"));
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.dashboard.error.deleteCategory"));
      }

      await refreshCategories();
      if (editingCategoryId === categoryId) {
        resetCategoryForm();
      }
      toast.success(t("admin.dashboard.toast.categoryDeleted"));
    } catch (error) {
      toast.error(error.message || t("admin.dashboard.error.deleteCategory"));
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { labelKey: "admin.dashboard.stats.admins", value: stats.admins, icon: UserRound },
          { labelKey: "admin.dashboard.stats.categories", value: stats.categories, icon: Tags },
          { labelKey: "admin.dashboard.stats.products", value: stats.products, icon: Package },
          { labelKey: "admin.dashboard.stats.featured", value: stats.featuredProducts, icon: Star },
          { labelKey: "admin.dashboard.stats.collection", value: stats.collectionProducts, icon: Eye },
          { labelKey: "admin.dashboard.stats.blogs", value: stats.blogs, icon: Newspaper },
          { labelKey: "admin.dashboard.stats.comments", value: stats.comments, icon: Check },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.labelKey} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t(item.labelKey)}</p>
                  <p className="mt-4 text-4xl font-heading font-bold text-foreground">{item.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="grid gap-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-heading font-semibold text-foreground">{t("admin.dashboard.adminList.title")}</h3>
              <Button variant="outline" size="sm" onClick={resetAdminForm}>
                <Plus className="h-4 w-4" />
                {t("admin.dashboard.adminList.new")}
              </Button>
            </div>

            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="rounded-2xl border border-border p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAdminId(admin.id);
                          setAdminForm({
                            name: admin.name,
                            email: admin.email,
                            password: "",
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        {t("admin.dashboard.action.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id)}
                        disabled={admin.id === currentAdmin.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("admin.dashboard.action.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAdminSubmit} className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-heading font-semibold text-foreground">
                {editingAdminId ? t("admin.dashboard.adminForm.editTitle") : t("admin.dashboard.adminForm.createTitle")}
              </h3>
              {editingAdminId && (
                <Button type="button" variant="ghost" size="sm" onClick={resetAdminForm}>
                  {t("admin.dashboard.action.reset")}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("admin.dashboard.adminForm.name")}</label>
                <Input
                  value={adminForm.name}
                  onChange={(event) => setAdminForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder={t("admin.dashboard.adminForm.namePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("admin.dashboard.adminForm.email")}</label>
                <Input
                  type="email"
                  value={adminForm.email}
                  onChange={(event) => setAdminForm((previous) => ({ ...previous, email: event.target.value }))}
                  placeholder={t("admin.dashboard.adminForm.emailPlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {editingAdminId ? t("admin.dashboard.adminForm.passwordKeep") : t("admin.dashboard.adminForm.passwordNew")}
                </label>
                <Input
                  type="password"
                  value={adminForm.password}
                  onChange={(event) => setAdminForm((previous) => ({ ...previous, password: event.target.value }))}
                  placeholder={t("admin.dashboard.adminForm.passwordPlaceholder")}
                  required={!editingAdminId}
                />
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={adminSubmitting}>
              {adminSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingAdminId ? (
                t("admin.dashboard.adminForm.submitUpdate")
              ) : (
                t("admin.dashboard.adminForm.submitCreate")
              )}
            </Button>
          </form>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-heading font-semibold text-foreground">{t("admin.dashboard.categoryList.title")}</h3>
              <Button variant="outline" size="sm" onClick={resetCategoryForm}>
                <Plus className="h-4 w-4" />
                {t("admin.dashboard.categoryList.new")}
              </Button>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-border p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {category.name?.zh ? `${category.name.en} / ${category.name.zh}` : category.name?.en || ""}
                      </p>
                      <p className="text-sm text-muted-foreground">{category.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setCategoryForm({ name: normalizeLocalizedString(category.name) });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        {t("admin.dashboard.action.edit")}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                        {t("admin.dashboard.action.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCategorySubmit} className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-heading font-semibold text-foreground">
                {editingCategoryId
                  ? t("admin.dashboard.categoryForm.editTitle")
                  : t("admin.dashboard.categoryForm.createTitle")}
              </h3>
              {editingCategoryId && (
                <Button type="button" variant="ghost" size="sm" onClick={resetCategoryForm}>
                  {t("admin.dashboard.action.reset")}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("admin.dashboard.categoryForm.nameEn")}</label>
                <Input
                  value={categoryForm.name.en}
                  onChange={(event) => setCategoryForm({ name: { ...categoryForm.name, en: event.target.value } })}
                  placeholder={t("admin.dashboard.categoryForm.placeholderEn")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("admin.dashboard.categoryForm.nameZh")}</label>
                <Input
                  value={categoryForm.name.zh}
                  onChange={(event) => setCategoryForm({ name: { ...categoryForm.name, zh: event.target.value } })}
                  placeholder={t("admin.dashboard.categoryForm.placeholderZh")}
                />
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={categorySubmitting}>
              {categorySubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingCategoryId ? (
                t("admin.dashboard.categoryForm.submitUpdate")
              ) : (
                t("admin.dashboard.categoryForm.submitCreate")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
