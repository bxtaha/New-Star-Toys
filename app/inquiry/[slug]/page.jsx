import { notFound } from "next/navigation";
import ProductInquiryPage from "@/pages/ProductInquiry";
import { getProductBySlug } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export default async function InquiryPage({ params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return <ProductInquiryPage product={product} />;
}

