"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

const BlogSection = ({ posts }) => {
  const { t } = useI18n();
  return (
    <section id="blog" className="section-padding bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.blog.badge")}</span>
          <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
            {t("home.blog.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("home.blog.subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-7">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </div>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>

                <h3 className="mb-3 text-lg font-heading font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h3>

                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-accent"
                >
                  {t("home.blog.readMore")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
