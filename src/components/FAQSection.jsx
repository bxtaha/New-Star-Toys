"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/components/I18nProvider";

const faqs = [
  { questionKey: "home.faq.q1", answerKey: "home.faq.a1" },
  { questionKey: "home.faq.q2", answerKey: "home.faq.a2" },
  { questionKey: "home.faq.q3", answerKey: "home.faq.a3" },
  { questionKey: "home.faq.q4", answerKey: "home.faq.a4" },
  { questionKey: "home.faq.q5", answerKey: "home.faq.a5" },
  { questionKey: "home.faq.q6", answerKey: "home.faq.a6" },
];

const FAQSection = () => {
  const { t } = useI18n();
  return (
    <section id="faq" className="section-padding bg-muted">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.faq.badge")}</span>
          <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">
            {t("home.faq.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("home.faq.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-3xl"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.questionKey}
                value={`item-${index}`}
                className="rounded-xl border border-border bg-card px-6 transition-shadow data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="py-5 text-left text-base font-heading font-semibold text-foreground hover:text-primary [&[data-state=open]]:text-primary">
                  {t(faq.questionKey)}
                </AccordionTrigger>
                <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                  {t(faq.answerKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
