import { notFound } from "next/navigation";
import BlogDetailPage from "@/pages/BlogDetail";
import { getBlogWithRelated } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }) {
  const { slug } = await params;

  const data = await getBlogWithRelated(slug);
  if (!data) {
    notFound();
  }

  return <BlogDetailPage post={data.post} relatedPosts={data.relatedPosts} />;
}
