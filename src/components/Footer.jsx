"use client";

import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

const quickLinks = [
  { key: "nav.home", href: "/#home" },
  { key: "nav.about", href: "/about" },
  { key: "nav.services", href: "/services" },
  { key: "nav.collection", href: "/collection" },
  { key: "nav.blogs", href: "/blogs" },
  { key: "nav.contact", href: "/contact" },
];

const productCategories = [
  "Stuffed Animals Manufacturer",
  "Plush Toy Series Manufacturer",
  "Plush Pillows Manufacturer",
  "Plush Keychains Manufacturer",
  "Pet Plush Toys Manufacturer",
  "Holiday Themed Manufacturer",
  "Plush Backpacks Manufacturer",
];

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="relative">
      <div className="bg-[#f0c040]">
        <div className="container py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div>
              <Link href="/" className="mb-4 inline-flex">
                <SmartImage src="/logo-nev.png" alt="YCNST" width={196} height={56} className="h-12 w-auto" />
              </Link>
              <p className="mb-5 text-sm leading-relaxed text-gray-800">
                {t("footer.companyLine1")}
                <br />
                {t("footer.companyLine2")}
              </p>
              <div className="flex gap-3">
                {[
                  { icon: "Y", label: "youtube" },
                  { icon: "f", label: "facebook" },
                  { icon: "in", label: "linkedin" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-700"
                    aria-label={social.label}
                  >
                    <span className="text-xs font-bold">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-5 font-heading text-lg font-bold text-gray-900">{t("footer.quickLinks")}</h4>
              <nav className="flex flex-col gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-gray-800 transition-colors hover:text-gray-900 hover:underline"
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="mb-5 font-heading text-lg font-bold text-gray-900">{t("footer.productCategory")}</h4>
              <nav className="flex flex-col gap-3">
                {productCategories.map((category) => (
                  <Link
                    key={category}
                    href="/collection"
                    className="text-sm text-gray-800 transition-colors hover:text-gray-900 hover:underline"
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="mb-5 font-heading text-lg font-bold text-gray-900">{t("footer.contactUs")}</h4>
              <div className="space-y-4">
                <a
                  href="mailto:adam@ycnewstar.com"
                  className="flex items-start gap-3 text-sm text-gray-800 transition-colors hover:text-gray-900"
                >
                  <Mail className="mt-0.5 h-5 w-5 shrink-0" />
                  adam@ycnewstar.com
                </a>
                <a
                  href="tel:+8618662061166"
                  className="flex items-start gap-3 text-sm text-gray-800 transition-colors hover:text-gray-900"
                >
                  <Phone className="mt-0.5 h-5 w-5 shrink-0" />
                  +86 18662061166
                </a>
                <a
                  href="https://wa.me/8619516377609"
                  className="flex items-start gap-3 text-sm text-gray-800 transition-colors hover:text-gray-900"
                >
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  WhatsApp: +86 19516377609
                </a>
                <div className="flex items-start gap-3 text-sm text-gray-800">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>9 Xinwei Road, Xinyang Industrial Zone, Yancheng, Jiangsu, China</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800/20">
          <div className="container py-5 text-center text-sm text-gray-800">
            Copyright © {new Date().getFullYear()} {t("footer.companyLine1")} {t("footer.rights")}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
