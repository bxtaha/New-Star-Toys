"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const ProjectCard = ({ project, index }) => (
  <Link key={project.title} href={`/product/${project.slug}`} className="block">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      className="group cursor-pointer"
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl">
        <Image
          src={project.image}
          alt={project.title}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/20" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-accent">
        {project.featuredLabel || project.categories?.[0] || project.category}
      </span>
      <h3 className="mt-1 text-lg font-heading font-semibold text-foreground">{project.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
    </motion.div>
  </Link>
);

const PortfolioSection = ({ products }) => {
  const { t } = useI18n();
  const shouldSlide = products.length > 3;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: shouldSlide,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(shouldSlide);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    updateScrollState();
    emblaApi.on("select", updateScrollState);
    emblaApi.on("reInit", updateScrollState);

    return () => {
      emblaApi.off("select", updateScrollState);
      emblaApi.off("reInit", updateScrollState);
    };
  }, [emblaApi, updateScrollState]);

  useEffect(() => {
    if (!emblaApi || !shouldSlide || isAutoplayPaused) {
      return;
    }

    const autoplayInterval = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => {
      window.clearInterval(autoplayInterval);
    };
  }, [emblaApi, isAutoplayPaused, shouldSlide]);

  return (
    <section id="portfolio" className="section-padding bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.portfolio.badge")}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3">
            {t("home.portfolio.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t("home.portfolio.subtitle")}
          </p>
        </motion.div>

        {shouldSlide ? (
          <div
            onMouseEnter={() => setIsAutoplayPaused(true)}
            onMouseLeave={() => setIsAutoplayPaused(false)}
          >
            <div className="mb-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="-ml-6 flex">
                {products.map((project, index) => (
                  <div
                    key={project.slug}
                    className="min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]"
                  >
                    <ProjectCard project={project} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {products.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;
