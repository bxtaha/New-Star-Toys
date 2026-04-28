"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Leaf, BadgeCheck, FileCheck } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const certifications = [
  { name: "ICTI", descriptionKey: "home.quality.cert.icti" },
  { name: "ISO 9001", descriptionKey: "home.quality.cert.iso9001" },
  { name: "CE", descriptionKey: "home.quality.cert.ce" },
  { name: "ASTM F963", descriptionKey: "home.quality.cert.astm" },
  { name: "EN71", descriptionKey: "home.quality.cert.en71" },
  { name: "CPSIA", descriptionKey: "home.quality.cert.cpsia" },
];

const features = [
  {
    icon: ShieldCheck,
    titleKey: "home.quality.feature.testing.title",
    descKey: "home.quality.feature.testing.desc",
  },
  {
    icon: Leaf,
    titleKey: "home.quality.feature.materials.title",
    descKey: "home.quality.feature.materials.desc",
  },
  {
    icon: BadgeCheck,
    titleKey: "home.quality.feature.audits.title",
    descKey: "home.quality.feature.audits.desc",
  },
  {
    icon: FileCheck,
    titleKey: "home.quality.feature.docs.title",
    descKey: "home.quality.feature.docs.desc",
  },
];

const QualitySection = () => {
  const { t } = useI18n();
  return (
    <section id="quality" className="section-padding bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.quality.badge")}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3">
            {t("home.quality.title")}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-full bg-sky flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{t(feature.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-xl font-heading font-bold text-primary-foreground text-center mb-8">
            {t("home.quality.certsTitle")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="bg-primary-foreground/10 rounded-xl p-4 text-center border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors"
              >
                <div className="text-lg font-heading font-bold text-secondary">{cert.name}</div>
                <div className="text-xs text-primary-foreground/70 mt-1">{t(cert.descriptionKey)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QualitySection;
