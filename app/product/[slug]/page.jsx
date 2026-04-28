import { notFound } from "next/navigation";
import ProductDetailPage from "@/pages/ProductDetail";
import { getProductBySlug } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return <ProductDetailPage product={product} />;
}
