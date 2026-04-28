"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageIcon, LayoutDashboard, LogOut, Mail, Newspaper, Package, Settings, Tags, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/I18nProvider";

const navigationItems = [
  { href: "/admin/dashboard", labelKey: "admin.nav.dashboard", icon: LayoutDashboard },
  { href: "/admin/inquiries", labelKey: "admin.nav.inquiries", icon: Mail },
  { href: "/admin/media", labelKey: "admin.nav.media", icon: ImageIcon },
  { href: "/admin/site-settings", labelKey: "admin.nav.siteSettings", icon: Settings },
  { href: "/admin/categories", labelKey: "admin.nav.categories", icon: Tags },
  { href: "/admin/products", labelKey: "admin.nav.products", icon: Package },
  { href: "/admin/blogs", labelKey: "admin.nav.blogs", icon: Newspaper },
];

const AdminShell = ({ currentAdmin, title, description, children }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/admin";
    } catch {
      window.location.href = "/admin";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="flex h-screen flex-col overflow-y-auto border-r border-border bg-card/60 px-6 py-8 lg:sticky lg:top-0">
          <div>
            <div className="mt-0 rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("lang.switch")}</p>
              <div className="mt-3 inline-flex rounded-full border border-border bg-background p-1">
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
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("admin.shell.signedInAs")}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{currentAdmin.name}</p>
                  <p className="text-sm text-muted-foreground">{currentAdmin.email}</p>
                </div>
              </div>
            </div>

            <nav className="mt-8 grid gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Button variant="outline" className="mt-auto w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {t("admin.shell.signOut")}
          </Button>
        </aside>

        <main className="px-6 py-8 md:px-10">
          <div className="mb-8">
            <h2 className="text-3xl font-heading font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
