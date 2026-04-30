"use client";

import { useEffect, useMemo, useState } from "react";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useI18n } from "@/components/I18nProvider";

const PAGE_SIZE = 6;

const AdminProductsManager = ({ initialProducts }) => {
  const { t } = useI18n();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingProductId, setDeletingProductId] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const categories = (product.categories || [product.category]).join(" ").toLowerCase();
      return (
        String(product.title?.en || product.title || "").toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        categories.includes(query)
      );
    });
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredProducts]);

  const handleDeleteProduct = async (productId) => {
    const shouldDelete = window.confirm(t("admin.products.confirmDelete"));
    if (!shouldDelete) {
      return;
    }

    setDeletingProductId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.products.error.delete"));
      }

      setProducts((previous) => previous.filter((product) => product.id !== productId));
      toast.success(t("admin.products.toast.deleted"));
    } catch (error) {
      toast.error(error.message || t("admin.products.error.delete"));
    } finally {
      setDeletingProductId("");
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("admin.products.list.searchPlaceholder")}
            className="pl-10"
          />
        </div>

        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            {t("admin.products.list.new")}
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[100px_1.2fr_1fr_120px_140px] gap-4 border-b border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
          <span>{t("admin.products.list.header.cover")}</span>
          <span>{t("admin.products.list.header.product")}</span>
          <span>{t("admin.products.list.header.categories")}</span>
          <span>{t("admin.products.list.header.featured")}</span>
          <span>{t("admin.products.list.header.actions")}</span>
        </div>

        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[100px_1.2fr_1fr_120px_140px] gap-4 border-b border-border px-4 py-4 last:border-b-0"
            >
              <div className="relative h-20 overflow-hidden rounded-xl bg-muted/40">
                <SmartImage
                  src={product.coverImage || "/placeholder.svg"}
                  alt={product.title?.en || "Product"}
                  fill
                  sizes="100px"
                  className="object-cover"
                  unoptimized
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{product.title?.en || ""}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{product.slug}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(product.categories || [product.category]).map((category) => (
                  <span
                    key={category}
                    className="h-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex items-center">
                {product.isFeatured ? (
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                    {t("admin.common.yes")}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">{t("admin.common.no")}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    {t("admin.dashboard.action.edit")}
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingProductId === product.id}
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  {deletingProductId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t("admin.products.list.empty")}</div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {t("admin.products.list.showing", {
            from: (currentPage - 1) * PAGE_SIZE + (paginatedProducts.length > 0 ? 1 : 0),
            to: (currentPage - 1) * PAGE_SIZE + paginatedProducts.length,
            count: filteredProducts.length,
          })}
        </p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            {t("common.previous")}
          </Button>
          <span className="min-w-20 text-center text-sm text-muted-foreground">
            {t("common.pageOf", { page: currentPage, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
          >
            {t("common.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsManager;
