"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useI18n } from "@/components/I18nProvider";

const PAGE_SIZE = 60;

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024)));
  const scaled = value / Math.pow(1024, idx);
  return `${scaled.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

const AdminMediaManager = ({ initialMedia, initialPagination, initialSummary }) => {
  const { t } = useI18n();
  const [media, setMedia] = useState(initialMedia || []);
  const [pagination, setPagination] = useState(
    initialPagination || { page: 1, pageSize: PAGE_SIZE, totalPages: 1, totalCount: 0 },
  );
  const [summary, setSummary] = useState(initialSummary || { totalCount: 0, usedCount: 0, unusedCount: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [folder, setFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState("");

  const folders = useMemo(() => {
    const set = new Set((media || []).map((item) => item.folder).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [media]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchQuery, status, kind, folder]);

  const fetchPage = async (page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page || 1));
      params.set("pageSize", String(pagination?.pageSize || PAGE_SIZE));
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }
      if (status) {
        params.set("status", status);
      }
      if (kind) {
        params.set("kind", kind);
      }
      if (folder) {
        params.set("folder", folder);
      }

      const response = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("admin.media.error.load"));
      }
      setMedia(Array.isArray(data.media) ? data.media : []);
      setPagination(data.pagination || { page: 1, pageSize: PAGE_SIZE, totalPages: 1, totalCount: 0 });
      setSummary(data.summary || { totalCount: 0, usedCount: 0, unusedCount: 0 });
    } catch (error) {
      toast.error(error.message || t("admin.media.error.load"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (url, used) => {
    if (used) {
      toast.error(t("admin.media.toast.inUse"));
      return;
    }
    const shouldDelete = window.confirm(t("admin.media.confirmDelete"));
    if (!shouldDelete) {
      return;
    }

    setDeletingUrl(url);
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("admin.media.error.delete"));
      }
      toast.success(t("admin.media.toast.deleted"));
      await fetchPage(pagination?.page || 1);
    } catch (error) {
      toast.error(error.message || t("admin.media.error.delete"));
    } finally {
      setDeletingUrl("");
    }
  };

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("admin.media.searchPlaceholder")}
              className="pl-10"
            />
          </div>

          <div className="w-full sm:max-w-xs">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">{t("admin.media.filter.status.all")}</option>
              <option value="used">{t("admin.media.filter.status.used")}</option>
              <option value="unused">{t("admin.media.filter.status.unused")}</option>
            </select>
          </div>

          <div className="w-full sm:max-w-xs">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option value="">{t("admin.media.filter.kind.all")}</option>
              <option value="image">{t("admin.media.filter.kind.images")}</option>
              <option value="video">{t("admin.media.filter.kind.videos")}</option>
            </select>
          </div>

          <div className="w-full sm:max-w-xs">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
            >
              <option value="">{t("admin.media.filter.folder.all")}</option>
              {folders.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button variant="outline" onClick={() => fetchPage(1)} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.media.refresh")}
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground">{t("admin.media.listTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("admin.media.summary", {
                total: summary?.totalCount || 0,
                used: summary?.usedCount || 0,
                unused: summary?.unusedCount || 0,
              })}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{t("admin.media.total", { count: pagination?.totalCount || 0 })}</p>
        </div>

        {media.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            {t("admin.media.empty")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {media.map((item) => (
              <div key={item.url} className="overflow-hidden rounded-2xl border border-border bg-background">
                <div className="relative aspect-video bg-muted/40">
                  {item.kind === "video" ? (
                    <video src={item.url} className="h-full w-full object-cover" controls />
                  ) : (
                    <img src={item.url} alt={item.fileName || "media"} className="h-full w-full object-cover" loading="lazy" />
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.fileName}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.url}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        item.used ? "bg-mint text-foreground" : "bg-peach text-foreground"
                      }`}
                    >
                      {item.used ? t("admin.media.badge.used") : t("admin.media.badge.unused")}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(item.bytes)}</span>
                    <span>{item.folder}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      disabled={item.used || deletingUrl === item.url}
                      onClick={() => handleDelete(item.url, item.used)}
                    >
                      {deletingUrl === item.url ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {t("admin.media.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("admin.media.pageOf", { page: currentPage, total: totalPages })}
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchPage(Math.max(1, currentPage - 1))} disabled={loading || currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPage(Math.min(totalPages, currentPage + 1))}
              disabled={loading || currentPage === totalPages}
            >
              {t("common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMediaManager;

