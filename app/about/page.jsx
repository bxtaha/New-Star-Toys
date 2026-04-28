"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Calendar,
  Droplets,
  Eye,
  Factory,
  FileCheck,
  FlaskConical,
  Globe,
  Hand,
  Handshake,
  Heart,
  Leaf,
  Microscope,
  Recycle,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import QualitySection from "@/components/QualitySection";
import VideoSection from "@/components/VideoSection";
import { Button } from "@/components/ui/button";
import { useHeroSettings } from "@/lib/client/hero";
import { useI18n } from "@/components/I18nProvider";
import factoryImg from "@/assets/about-hero.jpg";
import heroPlush from "@/assets/about-team.jpg";
import qualityFactoryImg from "@/assets/factory.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";

export const dynamic = "force-dynamic";

const team = [
  { name: "Linda Wang", role: "Founder & CEO", image: portfolio1 },
  { name: "David Chen", role: "Head of Design", image: portfolio2 },
  { name: "Sophie Liu", role: "Production Director", image: portfolio3 },
];

export default function AboutPage() {
  const { t } = useI18n();
  const hero = useHeroSettings("about");
  const heroTitle = hero.title || t("about.hero.defaultTitle");
  const heroSubtitle = hero.subtitle || t("about.hero.defaultSubtitle");
  const heroImage = hero.imageUrl || factoryImg;

  const milestones = [
    { year: "2004", titleKey: "about.milestone.2004.title", descKey: "about.milestone.2004.desc" },
    { year: "2009", titleKey: "about.milestone.2009.title", descKey: "about.milestone.2009.desc" },
    { year: "2014", titleKey: "about.milestone.2014.title", descKey: "about.milestone.2014.desc" },
    { year: "2018", titleKey: "about.milestone.2018.title", descKey: "about.milestone.2018.desc" },
    { year: "2022", titleKey: "about.milestone.2022.title", descKey: "about.milestone.2022.desc" },
    { year: "2024", titleKey: "about.milestone.2024.title", descKey: "about.milestone.2024.desc" },
  ];

  const values = [
    { icon: Heart, titleKey: "about.values.passion.title", descKey: "about.values.passion.desc" },
    { icon: Leaf, titleKey: "about.values.sustainability.title", descKey: "about.values.sustainability.desc" },
    { icon: ShieldCheck, titleKey: "about.values.quality.title", descKey: "about.values.quality.desc" },
    { icon: Handshake, titleKey: "about.values.partnership.title", descKey: "about.values.partnership.desc" },
  ];

  const testingSteps = [
    { icon: Eye, titleKey: "qualityPage.pipeline.step1.title", descKey: "qualityPage.pipeline.step1.desc" },
    { icon: Hand, titleKey: "qualityPage.pipeline.step2.title", descKey: "qualityPage.pipeline.step2.desc" },
    { icon: Thermometer, titleKey: "qualityPage.pipeline.step3.title", descKey: "qualityPage.pipeline.step3.desc" },
    { icon: Droplets, titleKey: "qualityPage.pipeline.step4.title", descKey: "qualityPage.pipeline.step4.desc" },
    { icon: FlaskConical, titleKey: "qualityPage.pipeline.step5.title", descKey: "qualityPage.pipeline.step5.desc" },
    { icon: ShieldCheck, titleKey: "qualityPage.pipeline.step6.title", descKey: "qualityPage.pipeline.step6.desc" },
  ];

  const materials = [
    { titleKey: "qualityPage.materials.m1.title", descKey: "qualityPage.materials.m1.desc" },
    { titleKey: "qualityPage.materials.m2.title", descKey: "qualityPage.materials.m2.desc" },
    { titleKey: "qualityPage.materials.m3.title", descKey: "qualityPage.materials.m3.desc" },
    { titleKey: "qualityPage.materials.m4.title", descKey: "qualityPage.materials.m4.desc" },
    { titleKey: "qualityPage.materials.m5.title", descKey: "qualityPage.materials.m5.desc" },
    { titleKey: "qualityPage.materials.m6.title", descKey: "qualityPage.materials.m6.desc" },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative pt-20">
          <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
            <Image
              src={heroImage}
              alt="YCNST plush toy manufacturing facility interior"
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
                {t("about.hero.badge")}
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

        <AboutSection />

        <section className="section-padding bg-background">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("about.mission.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("about.mission.title")}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: t("about.mission.missionTitle"),
                  text: t("about.mission.missionText"),
                },
                {
                  icon: Eye,
                  title: t("about.mission.visionTitle"),
                  text: t("about.mission.visionText"),
                },
                {
                  icon: Sparkles,
                  title: t("about.mission.purposeTitle"),
                  text: t("about.mission.purposeText"),
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-peach">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-heading font-semibold text-foreground">{item.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-muted">
          <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl shadow-xl"
            >
              <Image
                src={heroPlush}
                alt="YCNST design and craft team collaborating"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("about.story.badge")}</span>
              <h2 className="mb-6 mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("about.story.title")}
              </h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                {t("about.story.p1")}
              </p>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                {t("about.story.p2")}
              </p>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                {t("about.story.p3")}
              </p>
              <Button asChild size="lg">
                <Link href="/contact">{t("about.story.cta")}</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container">
            <div className="mb-16 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("about.journey.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("about.journey.title")}
              </h2>
            </div>

            <div className="relative mx-auto max-w-4xl">
              <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />
              <div className="space-y-10">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative flex gap-6 md:items-center ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="absolute left-4 mt-2 h-4 w-4 rounded-full border-4 border-background bg-accent md:left-1/2 md:mt-0 md:-translate-x-1/2" />
                    <div className="pl-12 md:w-1/2 md:pl-0 md:px-8">
                      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-accent" />
                          <span className="text-sm font-bold text-accent">{milestone.year}</span>
                        </div>
                        <h3 className="mb-1 text-lg font-heading font-semibold text-foreground">{t(milestone.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground">{t(milestone.descKey)}</p>
                      </div>
                    </div>
                    <div className="hidden md:block md:w-1/2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-muted">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("about.values.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">{t("about.values.title")}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-heading font-semibold text-foreground">{t(value.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(value.descKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("qualityPage.hero.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("qualityPage.hero.defaultTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {t("qualityPage.hero.defaultSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <QualitySection />

        <section className="section-padding bg-muted">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("qualityPage.pipeline.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("qualityPage.pipeline.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {t("qualityPage.pipeline.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testingSteps.map((step, index) => (
                <motion.div
                  key={step.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mint">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-heading font-semibold text-foreground">{t(step.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(step.descKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("qualityPage.materials.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("qualityPage.materials.title")}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {materials.map((material, index) => (
                <motion.div
                  key={material.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <h3 className="mb-2 font-heading font-semibold text-foreground">{t(material.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(material.descKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-muted">
          <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl shadow-xl"
            >
              <Image
                src={qualityFactoryImg}
                alt="YCNST eco-friendly production"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("qualityPage.sustain.badge")}</span>
              <h2 className="mb-6 mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("qualityPage.sustain.title")}
              </h2>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                {t("qualityPage.sustain.p1")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Recycle, titleKey: "qualityPage.sustain.b1.title", textKey: "qualityPage.sustain.b1.text" },
                  { icon: Leaf, titleKey: "qualityPage.sustain.b2.title", textKey: "qualityPage.sustain.b2.text" },
                  { icon: Microscope, titleKey: "qualityPage.sustain.b3.title", textKey: "qualityPage.sustain.b3.text" },
                  { icon: FileCheck, titleKey: "qualityPage.sustain.b4.title", textKey: "qualityPage.sustain.b4.text" },
                ].map((benefit) => (
                  <div key={benefit.titleKey} className="rounded-xl border border-border bg-card p-5">
                    <benefit.icon className="mb-2 h-5 w-5 text-accent" />
                    <div className="text-sm font-heading font-semibold text-foreground">{t(benefit.titleKey)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{t(benefit.textKey)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("qualityPage.labs.badge")}</span>
            <h2 className="mb-10 mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
              {t("qualityPage.labs.title")}
            </h2>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
              {["SGS", "Intertek", "BV", "TÜV"].map((lab) => (
                <div
                  key={lab}
                  className="flex items-center justify-center rounded-xl border border-border bg-card p-8"
                >
                  <div className="text-2xl font-heading font-bold tracking-wider text-primary">{lab}</div>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-sm text-muted-foreground">
              {t("qualityPage.labs.subtitle")}
            </p>
          </div>
        </section>

        <section className="section-padding bg-primary">
          <div className="container text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-secondary" />
            <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
              {t("qualityPage.cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              {t("qualityPage.cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">{t("qualityPage.cta.requestDocs")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container">
            <div className="mb-14 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("about.team.badge")}</span>
              <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("about.team.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {t("about.team.subtitle")}
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((person, index) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={person.image}
                      alt={`${person.name} — ${person.role}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-heading font-semibold text-foreground">{person.name}</h3>
                    <p className="mt-1 text-sm text-accent">{person.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <VideoSection
          eyebrow={t("about.video.badge")}
          title={t("about.video.title")}
          description={t("about.video.subtitle")}
          src=""
          poster={factoryImg}
          className="bg-background"
        />

        <section className="section-padding bg-muted">
          <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("about.factory.badge")}</span>
              <h2 className="mb-6 mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
                {t("about.factory.title")}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Factory, label: t("about.factory.stat.facility"), value: "8,000 m²" },
                  { icon: Users, label: t("about.factory.stat.team"), value: "200+" },
                  { icon: Globe, label: t("about.factory.stat.markets"), value: "30+" },
                  { icon: Award, label: t("about.factory.stat.certs"), value: "15+" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                    <stat.icon className="mb-2 h-5 w-5 text-accent" />
                    <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl shadow-xl"
            >
              <Image src={factoryImg} alt="YCNST production facility floor" loading="lazy" className="h-full w-full object-cover" />
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-primary">
          <div className="container text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl"
            >
              {t("about.cta.title")}
            </motion.h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              {t("about.cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">{t("about.cta.requestQuote")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/collection">{t("about.cta.viewCollection")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
