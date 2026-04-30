"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import heroImg from "@/assets/hero-plush.png";

const DEFAULT_TITLE = "Your Trusted OEM/ODM Plush Toy Partner";
const DEFAULT_SUBTITLE =
  "Premium custom plush toys manufactured with care. Serving top brands across Canada, USA & Europe with unmatched quality and craftsmanship.";
const DEFAULT_TITLE_ZH = "您可信赖的 OEM/ODM 毛绒玩具合作伙伴";
const DEFAULT_SUBTITLE_ZH = "用心制造高品质定制毛绒玩具，为加拿大、美国及欧洲的知名品牌提供卓越品质与精湛工艺。";

const HeroSection = ({ heroImageUrl, heroTitle, heroSubtitle }) => {
  const { t, language } = useI18n();
  const imageSource = heroImageUrl || heroImg;
  const title = heroTitle || (language === "zh" ? DEFAULT_TITLE_ZH : DEFAULT_TITLE);
  const subtitle = heroSubtitle || (language === "zh" ? DEFAULT_SUBTITLE_ZH : DEFAULT_SUBTITLE);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <SmartImage
          src={imageSource}
          alt="Premium plush toy manufacturing"
          className="w-full h-full object-cover"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      </div>

      <div className="container relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6 border border-secondary/30">
            {t("hero.badge")}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary-foreground leading-tight mb-6">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl font-body">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" className="text-base font-semibold" asChild>
              <Link href="/#contact">
                {t("cta.getQuote")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" className="text-base bg-white text-primary font-semibold border-0 hover:bg-white/90" asChild>
              <Link href="/#portfolio">{t("cta.viewPortfolio")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
