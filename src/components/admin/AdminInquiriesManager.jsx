"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Mail, Search, Send } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/I18nProvider";
import { toast } from "sonner";

const PAGE_SIZE = 20;

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value || "";
  }
}

const AdminInquiriesManager = ({ initialInquiries, initialPagination }) => {
  const { t } = useI18n();
  const [inquiries, setInquiries] = useState(initialInquiries || []);
  const [pagination, setPagination] = useState(
    initialPagination || { page: 1, pageSize: PAGE_SIZE, totalPages: 1, totalCount: 0 },
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubjects, setReplySubjects] = useState({});
  const [sendingId, setSendingId] = useState("");

  const defaultSubject = useMemo(() => t("admin.inquiries.reply.defaultSubject"), [t]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchQuery, status]);

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

      const response = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("admin.inquiries.error.load"));
      }
      setInquiries(data.inquiries || []);
      setPagination(data.pagination || { page: 1, pageSize: PAGE_SIZE, totalPages: 1, totalCount: 0 });
    } catch (error) {
      toast.error(error.message || t("admin.inquiries.error.load"));
    } finally {
      setLoading(false);
    }
  };

  const handleReplySend = async (inquiryId, toEmail) => {
    const subjectValue = String(replySubjects[inquiryId] || defaultSubject).trim();
    const messageValue = String(replyDrafts[inquiryId] || "").trim();
    if (!subjectValue || !messageValue) {
      toast.error(t("admin.inquiries.reply.validation"));
      return;
    }

    setSendingId(inquiryId);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectValue, message: messageValue }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("admin.inquiries.error.reply"));
      }
      const updated = data.inquiry;
      setInquiries((previous) => previous.map((item) => (item.id === inquiryId ? updated : item)));
      setReplyDrafts((previous) => ({ ...previous, [inquiryId]: "" }));
      setReplySubjects((previous) => ({ ...previous, [inquiryId]: defaultSubject }));
      toast.success(t("admin.inquiries.toast.replySent", { email: toEmail }));
    } catch (error) {
      toast.error(error.message || t("admin.inquiries.error.reply"));
    } finally {
      setSendingId("");
    }
  };

  const handleStatusUpdate = async (inquiryId, nextStatus) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("admin.inquiries.error.update"));
      }
      const updated = data.inquiry;
      setInquiries((previous) => previous.map((item) => (item.id === inquiryId ? updated : item)));
      toast.success(t("admin.inquiries.toast.updated"));
    } catch (error) {
      toast.error(error.message || t("admin.inquiries.error.update"));
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
              placeholder={t("admin.inquiries.searchPlaceholder")}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">{t("admin.inquiries.filter.all")}</option>
              <option value="new">{t("admin.inquiries.filter.new")}</option>
              <option value="replied">{t("admin.inquiries.filter.replied")}</option>
              <option value="archived">{t("admin.inquiries.filter.archived")}</option>
            </select>
          </div>
        </div>

        <Button variant="outline" onClick={() => fetchPage(1)} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.inquiries.refresh")}
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-heading font-semibold text-foreground">{t("admin.inquiries.listTitle")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("admin.inquiries.total", { count: pagination?.totalCount || inquiries.length })}
          </p>
        </div>

        {inquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            {t("admin.inquiries.empty")}
          </div>
        ) : (
          <Accordion type="multiple" className="divide-y divide-border rounded-2xl border border-border">
            {inquiries.map((inquiry) => {
              const repliesCount = inquiry.replies?.length || 0;
              const badge =
                inquiry.status === "new"
                  ? "bg-peach text-foreground"
                  : inquiry.status === "replied"
                    ? "bg-mint text-foreground"
                    : "bg-muted text-muted-foreground";

              const subjectValue = replySubjects[inquiry.id] ?? defaultSubject;
              const messageValue = replyDrafts[inquiry.id] ?? "";

              return (
                <AccordionItem key={inquiry.id} value={inquiry.id} className="border-b-0">
                  <AccordionTrigger className="px-5 py-5 hover:no-underline">
                    <div className="flex w-full flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{inquiry.name}</span>
                          <span className="text-sm text-muted-foreground">{inquiry.email}</span>
                          {inquiry.company ? (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              {inquiry.company}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatDate(inquiry.createdAt)}</span>
                          {inquiry.sourcePath ? <span>{inquiry.sourcePath}</span> : null}
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${badge}`}>
                            {t(`admin.inquiries.status.${inquiry.status}`)}
                          </span>
                          {repliesCount > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                              <Mail className="h-3 w-3" />
                              {t("admin.inquiries.repliesCount", { count: repliesCount })}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-background p-5">
                        <h4 className="text-sm font-semibold text-foreground">{t("admin.inquiries.details")}</h4>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{t("admin.inquiries.field.name")}</span>
                            <span className="font-medium text-foreground">{inquiry.name}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{t("admin.inquiries.field.email")}</span>
                            <span className="font-medium text-foreground">{inquiry.email}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{t("admin.inquiries.field.company")}</span>
                            <span className="font-medium text-foreground">{inquiry.company || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{t("admin.inquiries.field.language")}</span>
                            <span className="font-medium text-foreground">{inquiry.language || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{t("admin.inquiries.field.status")}</span>
                            <span className="font-medium text-foreground">{t(`admin.inquiries.status.${inquiry.status}`)}</span>
                          </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-border bg-card p-4">
                          <p className="text-sm font-semibold text-foreground">{t("admin.inquiries.field.message")}</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{inquiry.message}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(inquiry.id, "new")}
                            disabled={inquiry.status === "new"}
                          >
                            {t("admin.inquiries.action.markNew")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(inquiry.id, "archived")}
                            disabled={inquiry.status === "archived"}
                          >
                            {t("admin.inquiries.action.archive")}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-background p-5">
                        <h4 className="text-sm font-semibold text-foreground">{t("admin.inquiries.reply.title")}</h4>
                        <div className="mt-4 space-y-3">
                          <Input
                            value={subjectValue}
                            onChange={(event) =>
                              setReplySubjects((previous) => ({ ...previous, [inquiry.id]: event.target.value }))
                            }
                            placeholder={t("admin.inquiries.reply.subjectPlaceholder")}
                          />
                          <Textarea
                            rows={6}
                            value={messageValue}
                            onChange={(event) =>
                              setReplyDrafts((previous) => ({ ...previous, [inquiry.id]: event.target.value }))
                            }
                            placeholder={t("admin.inquiries.reply.messagePlaceholder")}
                          />
                          <Button
                            type="button"
                            className="w-full"
                            onClick={() => handleReplySend(inquiry.id, inquiry.email)}
                            disabled={sendingId === inquiry.id}
                          >
                            {sendingId === inquiry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {t("admin.inquiries.reply.send")}
                          </Button>
                        </div>

                        {repliesCount > 0 ? (
                          <div className="mt-6 space-y-3">
                            <p className="text-sm font-semibold text-foreground">{t("admin.inquiries.reply.history")}</p>
                            {inquiry.replies
                              .slice()
                              .reverse()
                              .map((reply) => (
                                <div key={reply.id} className="rounded-xl border border-border bg-card p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-foreground">{reply.subject}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(reply.sentAt)}</p>
                                  </div>
                                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{reply.message}</p>
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {t("admin.inquiries.reply.by", { name: reply.adminName })}
                                  </p>
                                </div>
                              ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("admin.inquiries.pageOf", { page: currentPage, total: totalPages })}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPage(Math.max(1, currentPage - 1))}
              disabled={loading || currentPage === 1}
            >
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

export default AdminInquiriesManager;
