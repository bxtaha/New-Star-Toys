"use client";

import { motion } from "framer-motion";
import { Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/I18nProvider";

const ContactSection = () => {
  const { t, language } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          language,
          sourcePath: window.location?.pathname || "",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("home.contact.error"));
      }
      toast.success(t("home.contact.toast"));
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      toast.error(error.message || t("home.contact.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">{t("home.contact.badge")}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3">
            {t("home.contact.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t("home.contact.subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5 bg-card p-8 rounded-2xl shadow-sm border border-border"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("home.contact.fullName")} *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("home.contact.placeholder.name")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("home.contact.email")} *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t("home.contact.placeholder.email")}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("home.contact.company")}</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t("home.contact.placeholder.company")}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("home.contact.projectDetails")} *</label>
              <Textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t("home.contact.placeholder.message")}
              />
            </div>
            <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("home.contact.sending")}</span>
                </span>
              ) : (
                t("home.contact.submit")
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t("home.contact.confidential")}
            </p>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {[
              { icon: Mail, label: t("home.contact.info.email"), value: "adam@ycnewstar.com" },
              { icon: Phone, label: t("home.contact.info.phone"), value: "+86 18662061166" },
              { icon: MapPin, label: t("home.contact.info.address"), value: "9 Xinwei Road, Xinyang Industrial Zone, Yancheng, Jiangsu, China" },
              { icon: Clock, label: t("home.contact.info.responseTime"), value: t("home.contact.info.responseValue") },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-sky flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
