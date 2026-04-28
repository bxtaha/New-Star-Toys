import "@/index.css";
import { Montserrat, Open_Sans } from "next/font/google";
import Providers from "./providers";
import { getRequestLanguage } from "@/lib/server/request-language";

const headingFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "YCNST - OEM/ODM Plush Toy Manufacturing",
  description: "Premium custom plush toys manufactured with care for global brands.",
};

export default async function RootLayout({ children }) {
  const lang = await getRequestLanguage();
  return (
    <html lang={lang} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${headingFont.variable} ${bodyFont.variable}`}>
        <Providers initialLanguage={lang}>{children}</Providers>
      </body>
    </html>
  );
}
