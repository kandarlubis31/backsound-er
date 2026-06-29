"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSounds, useCategories } from "@/hooks/use-sounds"
import { SoundGrid } from "@/components/sound/sound-grid"
import { CategoryPills } from "@/components/category/category-pills"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SORT_OPTIONS } from "@/lib/constants"
import type { SortOption } from "@/types"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeCategory = searchParams.get("category")
  const activeSort = (searchParams.get("sort") as SortOption) || "popular"

  const [trendingSort, setTrendingSort] = useState<SortOption>("popular")
  const [newSort, setNewSort] = useState<SortOption>("new")

  const { data: trending } = useSounds({ sort: trendingSort, limit: 12 })
  const { data: newest } = useSounds({ sort: newSort, limit: 12 })
  const { data: categories } = useCategories()

  function updateSort(sort: SortOption) {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === "popular") params.delete("sort")
    else params.set("sort", sort)
    if (activeCategory) params.set("category", activeCategory)
    router.push(`/${params.toString() ? `?${params}` : ""}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* Hero */}
      <section className="flex flex-col items-center gap-3 py-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            backsound-er
          </span>
        </h1>
        <p className="max-w-md text-muted-foreground text-lg">
          Ribuan sound effect siap dimainkan. Play, download, share —{" "}
          <span className="font-medium text-foreground">tanpa login</span>.
        </p>
      </section>

      {/* Category Pills */}
      <section>
        <CategoryPills
          categories={categories as { id: number; name: string; slug: string }[]}
          activeCategory={activeCategory}
          activeSort={activeSort}
          isLoading={!categories}
        />
      </section>

      <Separator />

      {/* Sort selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-1">Urut:</span>
        {SORT_OPTIONS.map(({ label, value }) => (
          <Button
            key={value}
            variant={activeSort === value ? "default" : "secondary"}
            size="xs"
            className="rounded-full"
            onClick={() => updateSort(value as SortOption)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Trending Section */}
      {!activeCategory && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🔥 Trending
            </h2>
            <div className="flex gap-1">
              <Button
                variant={trendingSort === "popular" ? "default" : "ghost"}
                size="xs"
                className="rounded-full"
                onClick={() => setTrendingSort("popular")}
              >
                Populer
              </Button>
              <Button
                variant={trendingSort === "new" ? "default" : "ghost"}
                size="xs"
                className="rounded-full"
                onClick={() => setTrendingSort("new")}
              >
                Baru
              </Button>
            </div>
          </div>
          <SoundGrid
            sounds={trending?.data}
            isLoading={!trending}
            emptyMessage="Belum ada sound trending. Scrape dulu datanya!"
          />
        </section>
      )}

      {/* New Section */}
      {!activeCategory && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🆕 Terbaru
            </h2>
            <div className="flex gap-1">
              <Button
                variant={newSort === "new" ? "default" : "ghost"}
                size="xs"
                className="rounded-full"
                onClick={() => setNewSort("new")}
              >
                Terbaru
              </Button>
              <Button
                variant={newSort === "popular" ? "default" : "ghost"}
                size="xs"
                className="rounded-full"
                onClick={() => setNewSort("popular")}
              >
                Populer
              </Button>
            </div>
          </div>
          <SoundGrid
            sounds={newest?.data}
            isLoading={!newest}
            emptyMessage="Belum ada sound. Scrape dulu datanya!"
          />
        </section>
      )}

      {/* Category View */}
      {activeCategory && (
        <section>
          <h2 className="text-xl font-bold mb-4">
            {categories && Array.isArray(categories)
              ? `📂 ${(categories as { slug: string; name: string }[]).find((c) => c.slug === activeCategory)?.name || activeCategory}`
              : `📂 ${activeCategory}`}
          </h2>
          <SoundGrid
            sounds={trending?.data}
            isLoading={!trending}
            emptyMessage="Kategori ini belum ada sound."
          />
        </section>
      )}

      {/* Load More */}
      {trending?.hasMore && (
        <div className="flex justify-center pb-8">
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              const currentPage = parseInt(searchParams.get("page") ?? "1")
              params.set("page", String(currentPage + 1))
              router.push(`/?${params}`)
            }}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
