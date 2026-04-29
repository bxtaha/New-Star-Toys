"use client";

import { motion } from "framer-motion";
import { Award, Globe, Users, Calendar } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import factoryImg from "@/assets/factory.jpg";
import { useI18n } from "@/components/I18nProvider";

const stats = [
  { icon: Calendar, value: "2004", labelKey: "home.about.statEstablished" },
  { icon: Globe, value: "30+", labelKey: "home.about.statCountries" },
  { icon: Users, value: "500+", labelKey: "home.about.statClients" },
  { icon: Award, value: "15+", labelKey: "home.about.statCerts" },
];

const AboutSection = () => {
  const { t } = useI18n();
  return (
    <section id="about" className="section-padding bg-muted">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.about.badge")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3 mb-6">
              {t("home.about.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("home.about.p1")}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t("home.about.p2")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.labelKey} className="text-center p-4 bg-card rounded-xl border border-border">
                  <stat.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t(stat.labelKey)}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <SmartImage
                src={factoryImg}
                alt="YCNST manufacturing facility"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-xl p-6 shadow-lg hidden md:block">
              <div className="text-3xl font-heading font-bold">22+</div>
              <div className="text-sm opacity-80">{t("home.about.yearsExcellence")}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
