"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, MessageCircle, Pencil, Plus, Search, ThumbsUp, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/components/I18nProvider";

const PAGE_SIZE = 6;

const AdminBlogsManager = ({ initialBlogs }) => {
  const { t } = useI18n();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingId, setReplySubmittingId] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState("");
  const [deletingReplyId, setDeletingReplyId] = useState("");

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return blogs;
    }

    return blogs.filter((blog) => {
      return (
        String(blog.title?.en || blog.title || "").toLowerCase().includes(query) ||
        blog.slug.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query)
      );
    });
  }, [blogs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredBlogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredBlogs]);

  const handleDeleteBlog = async (blogId) => {
    const shouldDelete = window.confirm(t("admin.blogs.confirmDeleteBlog"));
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogs.error.delete"));
      }

      setBlogs((previous) => previous.filter((blog) => blog.id !== blogId));
      toast.success(t("admin.blogs.toast.deleted"));
    } catch (error) {
      toast.error(error.message || t("admin.blogs.error.delete"));
    }
  };

  const handleReplySubmit = async (blogId, commentId) => {
    const text = String(replyDrafts[commentId] || "").trim();

    if (!text) {
      toast.error(t("admin.blogs.reply.validation"));
      return;
    }

    setReplySubmittingId(commentId);

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/comments/${commentId}/reply`, {
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

      setBlogs((previous) =>
        previous.map((blog) =>
          blog.id === blogId
            ? {
                ...blog,
                comments: blog.comments.map((comment) =>
                  comment.id === commentId
                    ? { ...comment, replies: [...(comment.replies || []), data.reply] }
                    : comment,
                ),
              }
            : blog,
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

  const handleDeleteComment = async (blogId, commentId) => {
    const shouldDelete = window.confirm(t("admin.blogs.confirmDeleteComment"));
    if (!shouldDelete) {
      return;
    }

    setDeletingCommentId(commentId);

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogs.error.deleteComment"));
      }

      setBlogs((previous) =>
        previous.map((blog) =>
          blog.id === blogId
            ? {
                ...blog,
                comments: blog.comments.filter((comment) => comment.id !== commentId),
              }
            : blog,
        ),
      );
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

  const handleDeleteReply = async (blogId, commentId, replyId) => {
    const shouldDelete = window.confirm(t("admin.blogs.confirmDeleteReply"));
    if (!shouldDelete) {
      return;
    }

    setDeletingReplyId(replyId);

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/comments/${commentId}/reply/${replyId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.blogs.error.deleteReply"));
      }

      setBlogs((previous) =>
        previous.map((blog) =>
          blog.id === blogId
            ? {
                ...blog,
                comments: blog.comments.map((comment) =>
                  comment.id === commentId
                    ? { ...comment, replies: (comment.replies || []).filter((reply) => reply.id !== replyId) }
                    : comment,
                ),
              }
            : blog,
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
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("admin.blogs.list.searchPlaceholder")}
            className="pl-10"
          />
        </div>

        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus className="h-4 w-4" />
            {t("admin.blogs.list.new")}
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[100px_1.4fr_0.9fr_120px_140px] gap-4 border-b border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
          <span>{t("admin.blogs.list.header.cover")}</span>
          <span>{t("admin.blogs.list.header.blog")}</span>
          <span>{t("admin.blogs.list.header.category")}</span>
          <span className="text-center">{t("admin.blogs.list.header.stats")}</span>
          <span>{t("admin.blogs.list.header.actions")}</span>
        </div>

        {paginatedBlogs.length > 0 ? (
          <Accordion type="multiple" className="divide-y divide-border">
            {paginatedBlogs.map((blog) => {
              const hasComments = blog.comments.length > 0;
              const rowContent = (
                <div className="grid grid-cols-[100px_1.4fr_0.9fr_120px_140px] gap-4 px-4 py-4">
                  <div className="relative h-20 overflow-hidden rounded-xl bg-muted/40">
                    <Image
                      src={blog.coverImage || "/placeholder.svg"}
                      alt={blog.title?.en || "Blog"}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{blog.title?.en || ""}</p>
                      {hasComments && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {t("admin.blogs.list.collapsible")}
                        </span>
                      )}
                    </div>
                    {/* <p className="mt-1 truncate text-sm text-muted-foreground">{blog.slug}</p> */}
                    <p className="mt-1 text-left text-xs text-muted-foreground">{blog.publishedAt}</p>
                  </div>

                  <div className="flex items-center">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {blog.category}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 mr-4">
                      <ThumbsUp className="h-4 w-4" />
                      {blog.likesCount}
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <MessageCircle
                        className={`h-4 w-4 ${blog.comments.some((comment) => !comment.replies?.length) ? "text-red-500" : ""}`}
                      />
                      {blog.comments.length}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/blogs/${blog.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        {t("admin.dashboard.action.edit")}
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteBlog(blog.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );

              if (!hasComments) {
                return <div key={blog.id}>{rowContent}</div>;
              }

              return (
                <AccordionItem key={blog.id} value={blog.id} className="border-b-0">
                  <AccordionTrigger hideIcon className="block px-0 py-0 hover:no-underline">
                    {rowContent}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <h4 className="text-sm font-semibold text-foreground">{t("admin.blogs.list.commentsReplies")}</h4>
                      <div className="mt-4 space-y-4">
                        {blog.comments.map((comment) => (
                          <div key={comment.id} className="rounded-2xl border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-foreground">{comment.name}</span>
                                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{comment.text}</p>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteComment(blog.id, comment.id)}
                                disabled={deletingCommentId === comment.id}
                              >
                                {deletingCommentId === comment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {t("admin.blogs.deleteComment")}
                              </Button>
                            </div>

                            {comment.replies?.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-sm font-semibold text-foreground">{reply.authorName}</span>
                                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                            {t("admin.blogs.adminReply")}
                                          </span>
                                          <span className="text-xs text-muted-foreground">{reply.date}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">{reply.text}</p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteReply(blog.id, comment.id, reply.id)}
                                        disabled={deletingReplyId === reply.id}
                                      >
                                        {deletingReplyId === reply.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 space-y-3">
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
                                onClick={() => handleReplySubmit(blog.id, comment.id)}
                                disabled={replySubmittingId === comment.id}
                              >
                                {replySubmittingId === comment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.blogs.reply.submit")}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t("admin.blogs.list.empty")}</div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {t("admin.blogs.list.showing", {
            from: (currentPage - 1) * PAGE_SIZE + (paginatedBlogs.length > 0 ? 1 : 0),
            to: (currentPage - 1) * PAGE_SIZE + paginatedBlogs.length,
            count: filteredBlogs.length,
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

export default AdminBlogsManager;
