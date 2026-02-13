import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getTools, getFeaturedTools, getCategoryCounts, getToolCount } from "@/lib/queries";
import { categories } from "@/data/categories";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);

  if (!category) {
    return {
      title: "Category Not Found | PickAIHub",
    };
  }

  return {
    title: `Best AI ${category.label} Tools & Software (2024) | PickAIHub`,
    description: `Discover the best AI tools for ${category.label.toLowerCase()}. Compare features, pricing, and reviews for top artificial intelligence software in ${category.label}.`,
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { q } = await searchParams;
  
  // Verify category exists
  const categoryExists = categories.some((c) => c.id === slug);
  if (!categoryExists) {
    notFound();
  }

  const [initialTools, featuredTools, categoryCounts, totalCount] = await Promise.all([
    getTools({ category: slug, search: q }),
    getFeaturedTools(),
    getCategoryCounts(),
    getToolCount(),
  ]);

  return (
    <HomeClient
      initialTools={initialTools}
      featuredTools={featuredTools}
      categoryCounts={categoryCounts}
      totalCount={totalCount}
      initialCategory={slug}
      initialSearch={q || ""}
    />
  );
}