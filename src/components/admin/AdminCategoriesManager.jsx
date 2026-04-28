"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { normalizeLocalizedString } from "@/lib/i18n/localized";
import { useI18n } from "@/components/I18nProvider";

const emptyCategoryForm = {
  name: { en: "", zh: "" },
};

const AdminCategoriesManager = ({ initialCategories }) => {
  const { t } = useI18n();
  const [categories, setCategories] = useState(initialCategories);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const refreshCategories = async () => {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t("admin.dashboard.error.loadCategories"));
    }

    setCategories(data.categories);
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
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
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

      <form onSubmit={handleCategorySubmit} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-heading font-semibold text-foreground">
            {editingCategoryId ? t("admin.dashboard.categoryForm.editTitle") : t("admin.dashboard.categoryForm.createTitle")}
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
          <p className="text-sm text-muted-foreground">
            {t("admin.categories.help")}
          </p>
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
  );
};

export default AdminCategoriesManager;
