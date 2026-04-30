"use client";

import { motion } from "framer-motion";
import SmartImage from "@/components/SmartImage";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OverlayLoader } from "@/components/Loader";
import { useHeroSettings } from "@/lib/client/hero";
import { useI18n } from "@/components/I18nProvider";
import heroPlush from "@/assets/contact-hero.jpg";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  const { t } = useI18n();
  const hero = useHeroSettings("contact");
  const heroTitle = hero.title || t("contactPage.hero.defaultTitle");
  const heroSubtitle = hero.subtitle || t("contactPage.hero.defaultSubtitle");
  const heroImage = hero.imageUrl || heroPlush;

  const offices = [
    {
      city: t("contactPage.office.yancheng"),
      address: t("contactPage.office.yancheng.addr"),
      phone: "+86 18662061166",
      email: "adam@ycnewstar.com",
    },
  ];

  const channels = [
    { icon: Mail, labelKey: "contactPage.channel.email", value: "adam@ycnewstar.com", href: "mailto:adam@ycnewstar.com" },
    { icon: Phone, labelKey: "contactPage.channel.phone", value: "+86 18662061166", href: "tel:+8618662061166" },
    { icon: MessageCircle, labelKey: "contactPage.channel.whatsapp", value: "+86 19516377609", href: "https://wa.me/8619516377609" },
    { icon: Send, labelKey: "contactPage.channel.wechat", value: "YCNS-toys2025", href: "#" },
  ];

  const faqs = [
    { qKey: "contactPage.faq.q1", aKey: "contactPage.faq.a1" },
    { qKey: "contactPage.faq.q2", aKey: "contactPage.faq.a2" },
    { qKey: "contactPage.faq.q3", aKey: "contactPage.faq.a3" },
    { qKey: "contactPage.faq.q4", aKey: "contactPage.faq.a4" },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative pt-20">
          <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
            <SmartImage
              src={heroImage}
              alt="YCNST welcoming office reception"
              fill
              priority
              sizes="100vw"
              className="h-full w-full object-cover"
            />
            {!hero.loaded ? <OverlayLoader /> : null}
            <div className="absolute inset-0 bg-primary/70" />
            <div className="relative container flex h-full flex-col justify-center text-primary-foreground">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold uppercase tracking-widest text-secondary"
              >
                {t("contactPage.hero.badge")}
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

        <section className="section-padding bg-background pb-0">
          <div className="container">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {channels.map((channel, index) => (
                <motion.a
                  key={channel.labelKey}
                  href={channel.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-peach">
                    <channel.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{t(channel.labelKey)}</div>
                    <div className="font-heading font-semibold text-foreground">{channel.value}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        <ContactSection />

        <section className="section-padding bg-background">
          <div className="container">
            <div className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("contactPage.offices.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("contactPage.offices.title")}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {offices.map((office, index) => (
                <motion.div
                  key={office.city}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-lg font-heading font-semibold text-foreground">{office.city}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{office.address}</p>
                  <div className="space-y-2 text-sm">
                    <a
                      href={`tel:${office.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Phone className="h-4 w-4" /> {office.phone}
                    </a>
                    <a
                      href={`mailto:${office.email}`}
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Mail className="h-4 w-4" /> {office.email}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container max-w-3xl">
            <div className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("contactPage.faq.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("contactPage.faq.title")}
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
      </main>

      <Footer />
    </div>
  );
}
