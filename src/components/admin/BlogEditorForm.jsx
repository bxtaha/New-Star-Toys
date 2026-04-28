"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { normalizeLocalizedString, normalizeLocalizedStringArray } from "@/lib/i18n/localized";
import { useI18n } from "@/components/I18nProvider";

const createInitialForm = (blog) => {
  const title = normalizeLocalizedString(blog?.title);
  const excerpt = normalizeLocalizedString(blog?.excerpt);
  const shortExcerpt = normalizeLocalizedString(blog?.shortExcerpt);
  const content = normalizeLocalizedStringArray(blog?.content);

  return {
  titleEn: title.en || "",
  titleZh: title.zh || "",
  slug: blog?.slug || "",
  category: blog?.category || "",
  excerptEn: excerpt.en || "",
  excerptZh: excerpt.zh || "",
  shortExcerptEn: shortExcerpt.en || "",
  shortExcerptZh: shortExcerpt.zh || "",
  publishedAt: blog?.publishedAt || new Date().toISOString().slice(0, 10),
  readTime: blog?.readTime || "",
  coverImage: blog?.coverImage || "",
  contentTextEn: (content.en || []).join("\n\n"),
  contentTextZh: (content.zh || []).join("\n\n"),
  };
};

function parseParagraphs(value) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

const BlogEditorForm = ({ mode, blog }) => {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState(createInitialForm(blog));
  const [comments, setComments] = useState(blog?.comments || []);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingId, setReplySubmittingId] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState("");
  const [deletingReplyId, setDeletingReplyId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleBlogCoverUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("type", "blogs");
      formData.append("entitySlug", form.slug || form.titleEn || "blog");
      Array.from(files).forEach((file) => formData.append("files", file));

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogEditor.error.upload"));
      }

      const firstFile = data.files?.[0];
      if (!firstFile) {
        throw new Error(t("admin.blogEditor.error.noFile"));
      }

      setForm((previous) => ({
        ...previous,
        coverImage: firstFile.url,
      }));
      toast.success(t("admin.blogEditor.toast.coverUploaded"));
    } catch (error) {
      toast.error(error.message || t("admin.blogEditor.error.upload"));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: { en: form.titleEn, zh: form.titleZh },
        slug: form.slug,
        category: form.category,
        excerpt: { en: form.excerptEn, zh: form.excerptZh },
        shortExcerpt: { en: form.shortExcerptEn, zh: form.shortExcerptZh },
        publishedAt: form.publishedAt,
        readTime: form.readTime,
        coverImage: form.coverImage,
        content: { en: parseParagraphs(form.contentTextEn), zh: parseParagraphs(form.contentTextZh) },
      };

      const response = await fetch(mode === "edit" ? `/api/admin/blogs/${blog.id}` : "/api/admin/blogs", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogEditor.error.save"));
      }

      toast.success(mode === "edit" ? t("admin.blogEditor.toast.updated") : t("admin.blogEditor.toast.created"));
      router.push("/admin/blogs");
      router.refresh();
    } catch (error) {
      toast.error(error.message || t("admin.blogEditor.error.save"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentId) => {
    const text = String(replyDrafts[commentId] || "").trim();

    if (!text) {
      toast.error(t("admin.blogs.reply.validation"));
      return;
    }

    setReplySubmittingId(commentId);

    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogs.error.addReply"));
      }

      setComments((previous) =>
        previous.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), data.reply] }
            : comment,
        ),
      );
      setReplyDrafts((previous) => ({
        ...previous,
        [commentId]: "",
      }));
      toast.success(t("admin.blogs.toast.replyAdded"));
    } catch (error) {
      toast.error(error.message || t("admin.blogs.error.addReply"));
    } finally {
      setReplySubmittingId("");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const shouldDelete = window.confirm(t("admin.blogs.confirmDeleteComment"));
    if (!shouldDelete) {
      return;
    }

    setDeletingCommentId(commentId);

    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogs.error.deleteComment"));
      }

      setComments((previous) => previous.filter((comment) => comment.id !== commentId));
      setReplyDrafts((previous) => {
        const nextDrafts = { ...previous };
        delete nextDrafts[commentId];
        return nextDrafts;
      });
      toast.success(t("admin.blogs.toast.commentDeleted"));
    } catch (error) {
      toast.error(error.message || t("admin.blogs.error.deleteComment"));
    } finally {
      setDeletingCommentId("");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const shouldDelete = window.confirm(t("admin.blogs.confirmDeleteReply"));
    if (!shouldDelete) {
      return;
    }

    setDeletingReplyId(replyId);

    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}/comments/${commentId}/reply/${replyId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogs.error.deleteReply"));
      }

      setComments((previous) =>
        previous.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: (comment.replies || []).filter((reply) => reply.id !== replyId) }
            : comment,
        ),
      );
      toast.success(t("admin.blogs.toast.replyDeleted"));
    } catch (error) {
      toast.error(error.message || t("admin.blogs.error.deleteReply"));
    } finally {
      setDeletingReplyId("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.titleEn")}</label>
          <Input
            value={form.titleEn}
            onChange={(event) => setForm((previous) => ({ ...previous, titleEn: event.target.value }))}
            placeholder="2026 Plush Toy Trends"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.titleZh")}</label>
          <Input
            value={form.titleZh}
            onChange={(event) => setForm((previous) => ({ ...previous, titleZh: event.target.value }))}
            placeholder="2026 毛绒玩具趋势"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.slug")}</label>
          <Input
            value={form.slug}
            onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
            placeholder="2026-plush-toy-trends"
            required
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.category")}</label>
          <Input
            value={form.category}
            onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))}
            placeholder="Trends"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.publishDate")}</label>
          <Input
            type="date"
            value={form.publishedAt}
            onChange={(event) => setForm((previous) => ({ ...previous, publishedAt: event.target.value }))}
            required
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.readTime")}</label>
          <Input
            value={form.readTime}
            onChange={(event) => setForm((previous) => ({ ...previous, readTime: event.target.value }))}
            placeholder="5 min read"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.coverImage")}</label>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
            <span className="inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {isUploading ? t("admin.productEditor.uploading") : t("admin.blogEditor.uploadCover")}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleBlogCoverUpload} />
          </label>
        </div>
      </div>

      {form.coverImage && <div className="mt-4 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">{form.coverImage}</div>}

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.excerptEn")}</label>
        <Textarea
          value={form.excerptEn}
          onChange={(event) => setForm((previous) => ({ ...previous, excerptEn: event.target.value }))}
          rows={3}
          placeholder="Summary shown on cards and blog lists."
          required
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.excerptZh")}</label>
        <Textarea
          value={form.excerptZh}
          onChange={(event) => setForm((previous) => ({ ...previous, excerptZh: event.target.value }))}
          rows={3}
          placeholder="用于博客列表与卡片的摘要。"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.shortExcerptEn")}</label>
        <Textarea
          value={form.shortExcerptEn}
          onChange={(event) => setForm((previous) => ({ ...previous, shortExcerptEn: event.target.value }))}
          rows={2}
          placeholder="Optional shorter teaser."
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.shortExcerptZh")}</label>
        <Textarea
          value={form.shortExcerptZh}
          onChange={(event) => setForm((previous) => ({ ...previous, shortExcerptZh: event.target.value }))}
          rows={2}
          placeholder="可选的更短引导语。"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.contentEn")}</label>
        <Textarea
          value={form.contentTextEn}
          onChange={(event) => setForm((previous) => ({ ...previous, contentTextEn: event.target.value }))}
          rows={14}
          placeholder="Separate paragraphs with a blank line."
          required
        />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blogEditor.contentZh")}</label>
        <Textarea
          value={form.contentTextZh}
          onChange={(event) => setForm((previous) => ({ ...previous, contentTextZh: event.target.value }))}
          rows={14}
          placeholder="段落之间用空行分隔。"
        />
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blogs")}>
          {t("admin.blogEditor.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "edit" ? t("admin.blogEditor.submitUpdate") : t("admin.blogEditor.submitCreate")}
        </Button>
      </div>

      {mode === "edit" && (
        <div className="mt-8 rounded-3xl border border-border bg-background p-6">
          <h3 className="text-xl font-heading font-semibold text-foreground">{t("admin.blogEditor.comments.title")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("admin.blogEditor.comments.subtitle")}</p>

          <div className="mt-6 space-y-4">
            {comments.length > 0 ? (
              <Accordion type="multiple" className="space-y-4">
                {comments.map((comment) => (
                  <AccordionItem
                    key={comment.id}
                    value={comment.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card px-5"
                  >
                    <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{comment.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                          {comment.replies?.length > 0 && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                              {comment.replies.length === 1
                                ? t("admin.blogEditor.comments.replyCountSingle", { count: comment.replies.length })
                                : t("admin.blogEditor.comments.replyCount", { count: comment.replies.length })}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 truncate text-sm text-muted-foreground">{comment.text}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <p className="text-sm text-muted-foreground">{comment.text}</p>

                      {comment.replies?.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground">{reply.authorName}</span>
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                    {t("admin.blogs.adminReply")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{reply.date}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteReply(comment.id, reply.id)}
                                  disabled={deletingReplyId === reply.id}
                                >
                                  {deletingReplyId === reply.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{t("admin.blogEditor.comments.actions")}</p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                          >
                            {deletingCommentId === comment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {t("admin.blogs.deleteComment")}
                          </Button>
                        </div>
                        <Textarea
                          rows={3}
                          value={replyDrafts[comment.id] || ""}
                          onChange={(event) =>
                            setReplyDrafts((previous) => ({
                              ...previous,
                              [comment.id]: event.target.value,
                            }))
                          }
                          placeholder={t("admin.blogs.reply.placeholder")}
                        />
                        <Button
                          type="button"
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={replySubmittingId === comment.id}
                        >
                          {replySubmittingId === comment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.blogs.reply.submit")}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                {t("admin.blogEditor.comments.none")}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default BlogEditorForm;
