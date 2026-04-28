"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeroSettings } from "@/lib/client/hero";
import { useI18n } from "@/components/I18nProvider";
import { useRouter } from "next/navigation";
import collectionHero from "@/assets/collection-hero.jpg";

const DEFAULT_HERO_TITLE = "Our Collection";
const DEFAULT_HERO_SUBTITLE =
  "Every renewal is an upgrade of aesthetics and functionality. Discover our latest plush creations crafted with care.";

const CollectionPage = ({ products = [], categories = [], initialCategorySlug = "" }) => {
  const { t, language } = useI18n();
  const router = useRouter();
  const hero = useHeroSettings("collection");
  const heroTitle = hero.title || t("collection.heroTitle") || DEFAULT_HERO_TITLE;
  const heroSubtitle = hero.subtitle || t("collection.heroSubtitle") || DEFAULT_HERO_SUBTITLE;
  const heroImage = hero.imageUrl || collectionHero;

  const categoryBySlug = useMemo(() => {
    const map = new Map();
    for (const category of Array.isArray(categories) ? categories : []) {
      if (category?.slug) {
        map.set(category.slug, category);
      }
    }
    return map;
  }, [categories]);

  const categoryByKey = useMemo(() => {
    const map = new Map();
    for (const category of Array.isArray(categories) ? categories : []) {
      if (category?.key) {
        map.set(category.key, category);
      }
    }
    return map;
  }, [categories]);

  const keyForInitialSlug = useMemo(() => {
    const normalized = String(initialCategorySlug || "").trim();
    if (!normalized) {
      return "";
    }
    return categoryBySlug.get(normalized)?.key || "";
  }, [categoryBySlug, initialCategorySlug]);

  const [activeCategoryKey, setActiveCategoryKey] = useState(() => keyForInitialSlug);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setActiveCategoryKey(keyForInitialSlug);
  }, [keyForInitialSlug]);

  const orderedCategories = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const category of Array.isArray(categories) ? categories : []) {
      const key = String(category?.key || "").trim();
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(category);
    }
    return result;
  }, [categories]);

  const labelForKey = useMemo(() => {
    return (key) => {
      const category = categoryByKey.get(key);
      const name = category?.name || {};
      if (language === "zh") {
        return String(name.zh || name.en || key);
      }
      return String(name.en || name.zh || key);
    };
  }, [categoryByKey, language]);

  const handleCategorySelect = (nextKey) => {
    const selectedKey = String(nextKey || "").trim();
    setActiveCategoryKey(selectedKey);

    if (!selectedKey) {
      router.replace("/collection", { scroll: false });
      return;
    }

    const slug = categoryByKey.get(selectedKey)?.slug || "";
    if (!slug) {
      router.replace("/collection", { scroll: false });
      return;
    }

    router.replace(`/collection?category=${encodeURIComponent(slug)}`, { scroll: false });
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryKeys = Array.isArray(product.categories) ? product.categories : [product.category].filter(Boolean);
        const matchesCategory = !activeCategoryKey || categoryKeys.includes(activeCategoryKey);
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [activeCategoryKey, products, searchQuery],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="relative h-[45vh] min-h-[340px] overflow-hidden">
        <Image
          src={heroImage}
          alt="Our Collection"
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("collection.badge")}</span>
            <h1 className="mt-2 text-3xl font-heading font-bold text-white md:text-5xl">{heroTitle}</h1>
            <p className="mt-3 max-w-xl text-white/70">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="shrink-0 lg:w-64">
            <div className="lg:sticky lg:top-24">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("collection.search")}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-foreground">
                  <Filter className="h-4 w-4" />
                  {t("collection.categoriesTitle")}
                </h3>
                <nav className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("")}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      !activeCategoryKey
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t("common.all")}
                  </button>
                  {orderedCategories.map((category) => (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => handleCategorySelect(category.key)}
                      className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        activeCategoryKey === category.key
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {labelForKey(category.key)}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t("collection.showing", { count: filteredProducts.length })}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground">{t("collection.none")}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted/30">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {(product.categories || [product.category]).filter(Boolean).map((categoryKey) => (
                          <span
                            key={categoryKey}
                            className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground"
                          >
                            {labelForKey(categoryKey)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="mb-2 font-heading text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                        {product.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {product.description}
                      </p>
                      <div className="mb-4 text-xs text-muted-foreground">
                        MOQ: <span className="font-semibold text-foreground">{product.moq}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link href={`/product/${product.slug}`}>{t("collection.detail")}</Link>
                        </Button>
                        <Button size="sm" className="flex-1" asChild>
                          <Link href="/#contact">{t("collection.inquiry")}</Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CollectionPage;
