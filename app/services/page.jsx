"use client";

import { motion } from "framer-motion";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  Gift,
  Heart,
  Package,
  PencilRuler,
  Scissors,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useHeroSettings } from "@/lib/client/hero";
import { useI18n } from "@/components/I18nProvider";
import heroPlush from "@/assets/services-hero.jpg";

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  const { t } = useI18n();
  const hero = useHeroSettings("services");
  const heroTitle = hero.title || t("services.hero.defaultTitle");
  const heroSubtitle = hero.subtitle || t("services.hero.defaultSubtitle");
  const heroImage = hero.imageUrl || heroPlush;

  const process = [
    { step: "01", icon: ClipboardList, titleKey: "services.work.step1.title", descKey: "services.work.step1.desc" },
    { step: "02", icon: PencilRuler, titleKey: "services.work.step2.title", descKey: "services.work.step2.desc" },
    { step: "03", icon: Scissors, titleKey: "services.work.step3.title", descKey: "services.work.step3.desc" },
    { step: "04", icon: Package, titleKey: "services.work.step4.title", descKey: "services.work.step4.desc" },
    { step: "05", icon: CheckCircle2, titleKey: "services.work.step5.title", descKey: "services.work.step5.desc" },
    { step: "06", icon: Truck, titleKey: "services.work.step6.title", descKey: "services.work.step6.desc" },
  ];

  const industries = [
    { icon: Briefcase, titleKey: "services.industries.brand.title", descKey: "services.industries.brand.desc" },
    { icon: Gift, titleKey: "services.industries.gifts.title", descKey: "services.industries.gifts.desc" },
    { icon: Heart, titleKey: "services.industries.charity.title", descKey: "services.industries.charity.desc" },
    { icon: ShoppingBag, titleKey: "services.industries.ecom.title", descKey: "services.industries.ecom.desc" },
    { icon: Building2, titleKey: "services.industries.parks.title", descKey: "services.industries.parks.desc" },
    { icon: Sparkles, titleKey: "services.industries.licensed.title", descKey: "services.industries.licensed.desc" },
  ];

  const advantages = [
    "services.advantage.b1",
    "services.advantage.b2",
    "services.advantage.b3",
    "services.advantage.b4",
    "services.advantage.b5",
    "services.advantage.b6",
  ];

  const faqs = [
    { qKey: "services.faq.q1", aKey: "services.faq.a1" },
    { qKey: "services.faq.q2", aKey: "services.faq.a2" },
    { qKey: "services.faq.q3", aKey: "services.faq.a3" },
    { qKey: "services.faq.q4", aKey: "services.faq.a4" },
    { qKey: "services.faq.q5", aKey: "services.faq.a5" },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative pt-20">
          <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
            <SmartImage
              src={heroImage}
              alt="YCNST plush toy artisans crafting"
              fill
              priority
              sizes="100vw"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/70" />
            <div className="relative container flex h-full flex-col justify-center text-primary-foreground">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold uppercase tracking-widest text-secondary"
              >
                {t("services.hero.badge")}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-3 max-w-3xl text-4xl font-heading font-bold md:text-6xl"
              >
                {heroTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 max-w-2xl text-lg text-primary-foreground/90"
              >
                {heroSubtitle}
              </motion.p>
            </div>
          </div>
        </section>

        <ServicesSection />

        <section className="section-padding bg-background">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("services.work.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("services.work.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {t("services.work.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {process.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="relative rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
                >
                  <div className="absolute right-5 top-4 text-5xl font-heading font-bold text-muted opacity-60">
                    {step.step}
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-peach">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-heading font-semibold text-foreground">{t(step.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(step.descKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-muted">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("services.industries.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("services.industries.title")}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {industries.map((industry, index) => (
                <motion.div
                  key={industry.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky">
                    <industry.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-heading font-semibold text-foreground">{t(industry.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(industry.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("services.advantage.badge")}</span>
              <h2 className="mb-6 mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("services.advantage.title")}
              </h2>
              <ul className="space-y-4">
                {advantages.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-muted-foreground">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { v: "500+", l: t("services.stats.brands") },
                { v: "30+", l: t("services.stats.countries") },
                { v: "22", l: t("services.stats.years") },
                { v: "200+", l: t("services.stats.artisans") },
              ].map((stat) => (
                <div key={stat.l} className="rounded-2xl border border-border bg-card p-8 text-center">
                  <div className="text-4xl font-heading font-bold text-accent">{stat.v}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{stat.l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-muted">
          <div className="container max-w-3xl">
            <div className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("services.faq.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("services.faq.title")}
              </h2>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.qKey} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-heading font-semibold">{t(faq.qKey)}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{t(faq.aKey)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="section-padding bg-primary">
          <div className="container text-center">
            <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
              {t("services.cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              {t("services.cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">{t("services.cta.requestQuote")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/collection">{t("services.cta.viewWork")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
