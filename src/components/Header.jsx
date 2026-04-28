"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

const navLinks = [
  { key: "nav.home", href: "/#home" },
  { key: "nav.services", href: "/services" },
  { key: "nav.collection", href: "/collection" },
  { key: "nav.blogs", href: "/blogs" },
  { key: "nav.about", href: "/about" },
  { key: "nav.contact", href: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const { language, setLanguage, t } = useI18n();
  const [collectionCategories, setCollectionCategories] = useState([]);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash || "");
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        if (cancelled) {
          return;
        }
        setCollectionCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryLabel = useMemo(() => {
    return (category) => {
      const name = category?.name || {};
      if (language === "zh") {
        return String(name.zh || name.en || category?.key || category?.slug || "");
      }
      return String(name.en || name.zh || category?.key || category?.slug || "");
    };
  }, [language]);

  const isLinkActive = (href) => {
    if (href.startsWith("/#")) {
      if (pathname !== "/") {
        return false;
      }
      const targetHash = href.slice(1);
      if (targetHash === "#home") {
        return hash === "" || hash === "#home";
      }
      return hash === targetHash;
    }

    if (href === "/collection") {
      return pathname === "/collection" || pathname.startsWith("/product/");
    }

    if (href === "/blogs") {
      return pathname === "/blogs" || pathname.startsWith("/blog/");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getNavLinkClass = (href, isMobile) => {
    const base = isMobile
      ? "px-6 py-3 text-sm font-medium transition-colors"
      : "text-sm font-medium transition-colors";
    const active = isLinkActive(href)
      ? "text-accent font-bold"
      : "text-muted-foreground hover:text-accent";
    const mobileExtra = isMobile ? " hover:bg-muted" : "";
    return `${base} ${active}${mobileExtra}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="font-heading font-bold text-lg md:text-xl tracking-tight text-primary">
          <Image
            src="/logo-nev.png"
            alt="YCNST"
            width={196}
            height={56}
            priority
            className="h-9 w-auto md:h-16"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.href !== "/collection") {
              return (
                <Link key={link.href} href={link.href} className={getNavLinkClass(link.href, false)}>
                  {t(link.key)}
                </Link>
              );
            }

            return (
              <div key={link.href} className="relative group">
                <Link href={link.href} className={getNavLinkClass(link.href, false)}>
                  <span className="inline-flex items-center gap-1">
                    {t(link.key)}
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </Link>
                <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
                  <div className="min-w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    <Link
                      href="/collection"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      {t("common.all")}
                    </Link>
                    {collectionCategories.map((category) => (
                      <Link
                        key={category.slug || category.key}
                        href={`/collection?category=${encodeURIComponent(category.slug)}`}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {categoryLabel(category)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="inline-flex rounded-full border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={t("lang.english")}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("zh")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                language === "zh" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={t("lang.chinese")}
            >
              中文
            </button>
          </div>
          <Button asChild>
            <Link href="/contact">{t("cta.getQuote")}</Link>
          </Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="flex flex-col py-4">
            {navLinks.map((link) => {
              if (link.href !== "/collection") {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={getNavLinkClass(link.href, true)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(link.key)}
                  </Link>
                );
              }

              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={getNavLinkClass(link.href, true)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(link.key)}
                  </Link>
                  <div className="px-6 pb-2">
                    <div className="mt-2 rounded-xl border border-border bg-background">
                      <Link
                        href="/collection"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setMobileOpen(false)}
                      >
                        {t("common.all")}
                      </Link>
                      {collectionCategories.map((category) => (
                        <Link
                          key={category.slug || category.key}
                          href={`/collection?category=${encodeURIComponent(category.slug)}`}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => setMobileOpen(false)}
                        >
                          {categoryLabel(category)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="px-6 pt-3">
              <div className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-2">
                <span className="text-sm font-medium text-foreground">{t("lang.switch")}</span>
                <div className="inline-flex rounded-full border border-border p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      language === "en"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("zh")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      language === "zh"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 pt-3">
              <Button className="w-full" asChild>
                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  {t("cta.getQuote")}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
