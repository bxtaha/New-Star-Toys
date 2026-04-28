"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Facebook,
  Heart,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useI18n } from "@/components/I18nProvider";

const BLOG_LIKES_STORAGE_KEY = "ycnst-liked-blogs";

const getStoredLikedBlogs = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(BLOG_LIKES_STORAGE_KEY);
    const parsedValue = JSON.parse(rawValue || "[]");
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const BlogDetailPage = ({ post, relatedPosts = [] }) => {
  const { t } = useI18n();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likesCount || 0);
  const [comments, setComments] = useState(post?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    const likedBlogs = getStoredLikedBlogs();
    setLiked(likedBlogs.includes(post?.slug));
  }, [post?.slug]);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-heading font-bold text-foreground">{t("blog.postNotFound")}</h1>
            <Link href="/blogs">
              <Button>{t("blog.backToBlog")}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleLike = async () => {
    if (likeSubmitting) {
      return;
    }

    setLikeSubmitting(true);

    try {
      const method = liked ? "DELETE" : "POST";
      const response = await fetch(`/api/blogs/${post.slug}/like`, {
        method,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update like for this post.");
      }

      const likedBlogs = getStoredLikedBlogs();
      const nextLikedBlogs = liked
        ? likedBlogs.filter((slug) => slug !== post.slug)
        : likedBlogs.includes(post.slug)
          ? likedBlogs
          : [...likedBlogs, post.slug];

      window.localStorage.setItem(BLOG_LIKES_STORAGE_KEY, JSON.stringify(nextLikedBlogs));
      setLiked(!liked);
      setLikeCount(data.likesCount);
    } catch (error) {
      toast.error(error.message || "Unable to update like for this post.");
    } finally {
      setLikeSubmitting(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !commenterName.trim()) {
      toast.error(t("blog.validation"));
      return;
    }

    setCommentSubmitting(true);

    try {
      const response = await fetch(`/api/blogs/${post.slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: commenterName,
          text: newComment,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to post this comment.");
      }

      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      setCommenterName("");
      toast.success(t("blog.commentPosted"));
    } catch (error) {
      toast.error(error.message || "Unable to post this comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const shareUrl = `https://ycnst.com/blog/${post.slug}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image src={post.image} alt={post.title} fill priority sizes="100vw" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container">
            <Link
              href="/blogs"
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> {t("blog.backToBlog")}
            </Link>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-accent">
              {post.category}
            </span>
            <h1 className="max-w-3xl text-3xl font-heading font-bold leading-tight text-white md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="flex flex-col gap-12 lg:flex-row">
          <aside className="order-2 shrink-0 lg:order-1 lg:w-80">
            <div className="lg:sticky lg:top-24">
              <h3 className="mb-6 text-lg font-heading font-bold text-foreground">{t("blog.related")}</h3>
              <div className="space-y-5">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex gap-4 rounded-xl p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={related.image}
                        alt={related.title}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                        {related.category}
                      </span>
                      <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {related.title}
                      </h4>
                      <span className="mt-1 block text-xs text-muted-foreground">{related.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="order-1 min-w-0 flex-1 lg:order-2">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-none prose prose-lg"
            >
              {post.content.map((paragraph) => (
                <p key={paragraph} className="mb-6 text-base leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </motion.article>

            <div className="mb-12 mt-12 flex items-center justify-between border-b border-t border-border py-6">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={liked || likeSubmitting}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                >
                  <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
                  {t("blog.likes", { count: likeCount })}
                </button>

                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  {t("blog.commentsCount", { count: comments.length })}
                </span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowShareMenu((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Share2 className="h-5 w-5" /> {t("blog.share")}
                </button>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-10 z-10 flex gap-2 rounded-xl border border-border bg-card p-3 shadow-lg"
                  >
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-opacity hover:opacity-80"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white transition-opacity hover:opacity-80"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white transition-opacity hover:opacity-80"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </motion.div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-8 text-xl font-heading font-bold text-foreground">
                {t("blog.commentsTitle", { count: comments.length })}
              </h3>

              <div className="mb-10">
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-xl border border-border bg-muted/40 p-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                            {comment.name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{comment.name}</span>
                              <span className="text-xs text-muted-foreground">{comment.date}</span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{comment.text}</p>
                          </div>
                        </div>

                        {comment.replies?.length > 0 && (
                          <div className="ml-12 mt-4 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="rounded-xl border border-border bg-card px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground">{reply.authorName}</span>
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                    {t("blog.adminReply")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{reply.date}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center text-sm text-muted-foreground">
                    {t("blog.noComments")}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h4 className="mb-4 text-base font-heading font-semibold text-foreground">{t("blog.leaveComment")}</h4>
                <Input
                  placeholder={t("blog.yourName")}
                  value={commenterName}
                  onChange={(event) => setCommenterName(event.target.value)}
                  className="mb-3"
                />
                <Textarea
                  placeholder={t("blog.writeComment")}
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  rows={4}
                  className="mb-4"
                />
                <Button onClick={handleComment} className="gap-2" disabled={commentSubmitting}>
                  <Send className="h-4 w-4" /> {t("blog.postComment")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;
