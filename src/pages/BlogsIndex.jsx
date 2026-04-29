"use client";

import { useMemo, useState } from "react";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/I18nProvider";

export default function BlogsIndexPage({ hero, blogs, recentBlogs, categories, pagination }) {
  const { t } = useI18n();
  const safePagination = pagination || { page: 1, totalPages: 1, totalCount: 0 };
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (blogs || []).filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesQuery =
        q === "" ||
        String(post.title || "").toLowerCase().includes(q) ||
        String(post.excerpt || "").toLowerCase().includes(q) ||
        String(post.shortExcerpt || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, blogs, query]);

  const heroImageUrl = hero?.imageUrl || recentBlogs?.[0]?.coverImage || blogs?.[0]?.coverImage || "/uploads/seed/blog-1.jpg";
  const heroTitle = hero?.title || t("blogs.title");
  const heroSubtitle = hero?.subtitle || t("blogs.subtitle");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="relative h-[50vh] min-h-[400px] overflow-hidden pt-20">
        <SmartImage src={heroImageUrl} alt="YCNST Blog" fill priority sizes="100vw" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container">
            <span className="block text-xs font-semibold uppercase tracking-wider text-accent mb-3">{t("blogs.badge")}</span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white max-w-3xl leading-tight">
              {heroTitle}
            </h1>
            <p className="text-base md:text-lg text-white/80 mt-4 max-w-2xl leading-relaxed">{heroSubtitle}</p>
          </div>
        </div>
      </div>

      <section className="pt-12 pb-6 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {(categories || ["All"]).map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === "All" ? t("common.all") : cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("blogs.search")}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-80 shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-lg font-heading font-bold text-foreground mb-6">{t("blogs.recent")}</h3>
              <div className="space-y-5">
                {(recentBlogs || []).slice(0, 5).map((recent) => (
                  <Link
                    key={recent.slug}
                    href={`/blog/${recent.slug}`}
                    className="group flex gap-4 p-3 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <SmartImage
                        src={recent.coverImage}
                        alt={recent.title}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">{recent.category}</span>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1 leading-snug">
                        {recent.title}
                      </h4>
                      <span className="text-xs text-muted-foreground mt-1 block">{recent.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-8">{t("blogs.all")}</h2>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">{t("blogs.noResults")}</div>
            ) : (
              <div className="space-y-6">
                {filtered.map((post, index) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5 bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-auto sm:h-full bg-muted">
                        <SmartImage
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground bg-accent px-2.5 py-1 rounded-full">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 sm:py-6 sm:pr-6 sm:pl-0 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {post.date}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-heading font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                          {post.shortExcerpt || post.excerpt}
                        </p>
                        <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors flex items-center gap-1">
                          {t("blogs.readArticle")}
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline" disabled={safePagination.page <= 1}>
                <Link href={`/blogs?page=${Math.max(1, safePagination.page - 1)}`}>{t("common.previous")}</Link>
              </Button>
              <div className="text-sm text-muted-foreground">
                {t("common.pageOf", { page: safePagination.page, total: safePagination.totalPages })}
              </div>
              <Button asChild variant="outline" disabled={safePagination.page >= safePagination.totalPages}>
                <Link href={`/blogs?page=${Math.min(safePagination.totalPages, safePagination.page + 1)}`}>{t("common.next")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>


      <Footer />
    </div>
  );
}
