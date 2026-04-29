"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/components/I18nProvider";

const ProductDetailPage = ({ product }) => {
  const { t } = useI18n();
  const router = useRouter();
  const variants = product?.variants || [];
  const [activeVariantSlug, setActiveVariantSlug] = useState(product?.selectedVariantSlug || product?.slug || "");
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const mediaItems = useMemo(() => {
    const variant = variants.find((item) => item.slug === activeVariantSlug);
    if (variant?.media?.length) {
      return variant.media;
    }
    return product?.media || [];
  }, [activeVariantSlug, product?.media, variants]);

  const [activeMediaUrl, setActiveMediaUrl] = useState(product?.coverImage || "");

  useEffect(() => {
    const variant = variants.find((item) => item.slug === activeVariantSlug);
    const nextCover = variant?.coverImage || product?.coverImage || "";
    setActiveMediaUrl((previous) => {
      if (previous && mediaItems.some((item) => item.url === previous)) {
        return previous;
      }
      if (mediaItems.some((item) => item.url === nextCover)) {
        return nextCover;
      }
      return mediaItems[0]?.url || nextCover;
    });
  }, [activeVariantSlug, mediaItems, product?.coverImage, variants]);

  const activeMedia = mediaItems.find((item) => item.url === activeMediaUrl) || mediaItems[0];
  const backHref = product?.showInCollection ? "/collection" : "/#portfolio";
  const backLabel = product?.showInCollection ? t("product.backToCollection") : t("product.backToPortfolio");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!mediaItems.length) {
        return;
      }

      const isPrev = event.key === "ArrowLeft" || event.key === "ArrowUp";
      const isNext = event.key === "ArrowRight" || event.key === "ArrowDown";
      if (!isPrev && !isNext) {
        return;
      }

      event.preventDefault();

      const currentIndex = Math.max(
        0,
        mediaItems.findIndex((item) => item.url === activeMediaUrl),
      );
      const nextIndex = isPrev
        ? (currentIndex - 1 + mediaItems.length) % mediaItems.length
        : (currentIndex + 1) % mediaItems.length;
      setActiveMediaUrl(mediaItems[nextIndex]?.url || mediaItems[0]?.url || "");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMediaUrl, mediaItems]);

  const handleZoomMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">{t("product.notFound")}</h1>
            <Link href="/collection" className="text-accent hover:underline">
              ← {t("product.backToCollection")}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <Link href={backHref} className="inline-flex items-center gap-2 text-accent hover:underline mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className=" max-w-[520px]">
                <div
                  className={`rounded-2xl overflow-hidden aspect-square relative bg-muted/30 ${
                    activeMedia?.kind === "image" ? (isZooming ? "cursor-zoom-out" : "cursor-zoom-in") : ""
                  }`}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleZoomMove}
                >
                {activeMedia?.kind === "video" ? (
                  <video src={activeMedia.url} controls className="h-full w-full object-cover" />
                ) : (
                  <SmartImage
                    src={activeMedia?.url || product.coverImage}
                    alt={product.title}
                    className={`w-full h-full object-cover ${isZooming ? "" : "transition-transform duration-300"}`}
                    style={{
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      transform: isZooming ? "scale(2.6)" : "scale(1)",
                    }}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
                </div>
              </div>

              {mediaItems.length > 1 && (
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {mediaItems.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => setActiveMediaUrl(item.url)}
                      className={`relative overflow-hidden rounded-lg border ${activeMedia?.url === item.url ? "border-primary" : "border-border"}`}
                    >
                      {item.kind === "video" ? (
                        <div className="flex aspect-square items-center justify-center bg-muted text-[10px] font-medium text-muted-foreground">
                          {t("common.video")}
                        </div>
                      ) : (
                        <div className="relative aspect-square">
                          <SmartImage src={item.url} alt={product.title} fill sizes="18vw" className="object-cover" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-wrap gap-2">
                {(product.categories || [product.category]).map((category) => (
                  <span key={category} className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {category}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">{product.title}</h1>

              {variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-foreground">{t("product.colorVariants")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.slug}
                        type="button"
                        onClick={() => {
                          setActiveVariantSlug(variant.slug);
                          router.replace(`/product/${encodeURIComponent(variant.slug)}`, { scroll: false });
                        }}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                          activeVariantSlug === variant.slug ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: variant.colorHex || "#000000" }} />
                        <span>{variant.colorName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.description ? <p className="text-muted-foreground mt-4 text-base leading-relaxed">{product.description}</p> : null}
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{product.details}</p>

              <div className="mt-8">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">{t("product.keyFeatures")}</h3>
                <ul className="space-y-3">
                  {(product.features || []).map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 bg-muted/50 rounded-xl p-6">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">{t("product.specifications")}</h3>
                <dl className="grid grid-cols-2 gap-4">
                  {(product.specs || []).map((spec) => (
                    <div key={spec.label}>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{spec.label}</dt>
                      <dd className="text-foreground mt-1">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <Link
                href="/#contact"
                className="inline-block mt-8 px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                {t("product.requestQuote")}
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
