import CollectionPage from "@/pages/Collection";
import { getCollectionPageData } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export default async function CollectionRoute({ searchParams }) {
  const { products, categories } = await getCollectionPageData();
  const resolvedSearchParams = await searchParams;
  const initialCategorySlug = typeof resolvedSearchParams?.category === "string" ? resolvedSearchParams.category : "";

  return <CollectionPage products={products} categories={categories} initialCategorySlug={initialCategorySlug} />;
}
