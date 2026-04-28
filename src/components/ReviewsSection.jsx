"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const reviews = [
  {
    name: "Sarah Mitchell",
    company: "ToyWorld Canada",
    rating: 5,
    textKey: "home.reviews.sarah",
    country: "🇨🇦 Canada",
  },
  {
    name: "Thomas Weber",
    company: "KinderSpiel GmbH",
    rating: 5,
    textKey: "home.reviews.thomas",
    country: "🇩🇪 Germany",
  },
  {
    name: "Emily Chen",
    company: "PetPals Inc.",
    rating: 5,
    textKey: "home.reviews.emily",
    country: "🇺🇸 USA",
  },
  {
    name: "James Oliver",
    company: "Cuddly Creations UK",
    rating: 4,
    textKey: "home.reviews.james",
    country: "🇬🇧 UK",
  },
];

const ReviewsSection = () => {
  const { t } = useI18n();
  return (
    <section id="reviews" className="section-padding relative overflow-hidden bg-muted">
      <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/5" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/5" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.reviews.badge")}</span>
          <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
            {t("home.reviews.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("home.reviews.subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-secondary/20 transition-colors group-hover:text-secondary/40" />

              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={`h-4 w-4 ${starIndex < review.rating ? "fill-secondary text-secondary" : "text-border"}`}
                  />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-foreground/80">"{t(review.textKey)}"</p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-semibold text-foreground">{review.name}</div>
                  <div className="text-xs text-muted-foreground">{review.company}</div>
                </div>
                <span className="text-sm text-muted-foreground">{review.country}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
