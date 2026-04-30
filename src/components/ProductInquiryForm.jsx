"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import SmartImage from "@/components/SmartImage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/I18nProvider";

export default function ProductInquiryForm({ product }) {
  const { t, language } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          language,
          productId: product?.id || "",
          productSlug: product?.slug || "",
          productVariantSlug: product?.selectedVariantSlug || "",
          productTitle: product?.title || "",
          productImage: product?.coverImage || product?.image || "",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("home.contact.error"));
      }
      toast.success(t("home.contact.toast"));
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      toast.error(error.message || t("home.contact.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const productHref = product?.selectedVariantSlug
    ? `/product/${encodeURIComponent(product.selectedVariantSlug)}`
    : product?.slug
      ? `/product/${encodeURIComponent(product.slug)}`
      : "/collection";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="mb-8">
            <Link href={productHref} className="text-sm font-medium text-accent hover:underline">
              ← {product?.title || t("cta.viewPortfolio")}
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30">
                <SmartImage
                  src={product?.coverImage || product?.image || "/placeholder.svg"}
                  alt={product?.title || "Product"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <h1 className="mt-6 text-2xl font-heading font-bold text-foreground">{product?.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {(product?.categories || [product?.category]).filter(Boolean).map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {product?.moq ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>MOQ</span>
                    <span className="font-medium text-foreground">{product.moq}</span>
                  </div>
                ) : null}
                {product?.slug ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Slug</span>
                    <span className="font-medium text-foreground">{product.slug}</span>
                  </div>
                ) : null}
                {product?.selectedVariantSlug && product?.selectedVariantSlug !== product?.slug ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Variant</span>
                    <span className="font-medium text-foreground">{product.selectedVariantSlug}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-foreground">{t("cta.getQuote")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.contact.subtitle")}</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("home.contact.fullName")} *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder={t("home.contact.placeholder.name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("home.contact.email")} *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder={t("home.contact.placeholder.email")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("home.contact.company")}</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                    placeholder={t("home.contact.placeholder.company")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("home.contact.projectDetails")} *</label>
                  <Textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder={t("home.contact.placeholder.message")}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? t("home.contact.sending") : t("home.contact.submit")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

