import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import AboutSection from "@/components/AboutSection";
import QualitySection from "@/components/QualitySection";
import ReviewsSection from "@/components/ReviewsSection";
import BlogSection from "@/components/BlogSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { getHomePageData } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { featuredProducts, latestBlogs, heroImageUrl, heroTitle, heroSubtitle } = await getHomePageData();

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection heroImageUrl={heroImageUrl} heroTitle={heroTitle} heroSubtitle={heroSubtitle} />
      <ServicesSection />
      <PortfolioSection products={featuredProducts} />
      <AboutSection />
      <QualitySection />
      <ReviewsSection />
      <BlogSection posts={latestBlogs} />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
