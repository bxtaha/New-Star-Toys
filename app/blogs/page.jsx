import BlogsIndexPage from "@/pages/BlogsIndex";
import { getBlogsIndexPageData } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export default async function BlogsPage({ searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const { hero, blogs, recentBlogs, pagination, categories } = await getBlogsIndexPageData({ page, pageSize: 6 });
  return (
    <BlogsIndexPage
      hero={hero}
      blogs={blogs}
      recentBlogs={recentBlogs}
      categories={categories}
      pagination={pagination}
    />
  );
}
