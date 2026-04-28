"use client";

import { motion } from "framer-motion";
import { Palette, Factory, ShieldCheck, Truck, Lightbulb, Layers } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const services = [
  {
    icon: Palette,
    titleKey: "home.services.customDesign.title",
    descKey: "home.services.customDesign.desc",
    bg: "bg-peach",
  },
  {
    icon: Factory,
    titleKey: "home.services.oem.title",
    descKey: "home.services.oem.desc",
    bg: "bg-sky",
  },
  {
    icon: Lightbulb,
    titleKey: "home.services.odm.title",
    descKey: "home.services.odm.desc",
    bg: "bg-mint",
  },
  {
    icon: Layers,
    titleKey: "home.services.sourcing.title",
    descKey: "home.services.sourcing.desc",
    bg: "bg-peach",
  },
  {
    icon: ShieldCheck,
    titleKey: "home.services.qc.title",
    descKey: "home.services.qc.desc",
    bg: "bg-sky",
  },
  {
    icon: Truck,
    titleKey: "home.services.logistics.title",
    descKey: "home.services.logistics.desc",
    bg: "bg-mint",
  },
];

const ServicesSection = () => {
  const { t } = useI18n();

  return (
    <section id="services" className="section-padding bg-muted">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.services.badge")}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3">
            {t("home.services.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t("home.services.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow group border border-border"
            >
              <div className={`w-14 h-14 rounded-xl ${service.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <service.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{t(service.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(service.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
