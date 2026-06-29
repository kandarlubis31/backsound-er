"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useSounds, useCategories } from "@/hooks/use-sounds"
import { SoundGrid } from "@/components/sound/sound-grid"
import { CategoryPills } from "@/components/category/category-pills"
import { Button } from "@/components/ui/button"
import { SORT_OPTIONS } from "@/lib/constants"
import type { SortOption } from "@/types"

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [sort, setSort] = useState<SortOption>("popular")

  const { data: result, isLoading } = useSounds({
    category: slug,
    sort,
  })
  const { data: categories } = useCategories()

  const categoryName =
    categories && Array.isArray(categories)
      ? (categories as { slug: string; name: string }[]).find(
          (c) => c.slug === slug
        )?.name || slug
      : slug

  const categoryIcon =
    categories && Array.isArray(categories)
      ? (categories as { slug: string; icon?: string | null }[]).find(
          (c) => c.slug === slug
        )?.icon
      : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{categoryIcon || "📂"}</span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {categoryName}
          </h1>
          {result?.total !== undefined && (
            <p className="text-sm text-muted-foreground">
              {result.total} sound
            </p>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <CategoryPills
        categories={categories as { id: number; name: string; slug: string }[]}
        activeCategory={slug}
        isLoading={!categories}
      />

      {/* Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        {SORT_OPTIONS.map(({ label, value }) => (
          <Button
            key={value}
            variant={sort === value ? "default" : "secondary"}
            size="xs"
            className="rounded-full"
            onClick={() => setSort(value as SortOption)}
          >
            {label}
          </Button>
        ))}
      </div>

      <SoundGrid
        sounds={result?.data}
        isLoading={isLoading}
        emptyMessage={`Kategori "${categoryName}" belum ada sound.`}
      />
    </div>
  )
}
